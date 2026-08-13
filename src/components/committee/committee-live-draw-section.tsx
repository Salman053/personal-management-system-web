"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { luckyDrawService } from "@/services/lucky-draw"
import type { LuckyDraw } from "@/types/lucky-draw"
import { DrawReel } from "@/components/lucky-draw/draw-reel"
import { getGuestId, getGuestName, setGuestName, registerIdentity } from "@/lib/lucky-draw-guest"
import {
  Gift,
  Trophy,
  Sparkles,
  Crown,
  Users,
  Play,
  Copy,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"

interface CommitteeLiveDrawSectionProps {
  committeeId: string
  committeeName: string
}

const AVATAR_COLORS = [
  "bg-pink-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
]

const CONFETTI_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#f6b93b", "#ff9ff3"]

/**
 * Public, realtime lucky draw section shown inside the committee portal.
 * All members on different browsers watch the EXACT same spin, triggered
 * by the shared Firestore status, and the winner is confirmed by the admin.
 */
export function CommitteeLiveDrawSection({
  committeeId,
  committeeName,
}: CommitteeLiveDrawSectionProps) {
  const [draws, setDraws] = useState<LuckyDraw[]>([])
  const [activeDraw, setActiveDraw] = useState<LuckyDraw | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestNameLocal] = useState(getGuestName())
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const previousStatus = useRef<string>("")
  const previousWinnerId = useRef<string | null>(null)
  const confettiFired = useRef(false)

  const fireConfetti = () => {
    const duration = 3500
    const end = Date.now() + duration
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors: CONFETTI_COLORS })
      confetti({ particleCount: 2, angle: 100, spread: 40, origin: { x: 1 }, colors: CONFETTI_COLORS })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  // Realtime watch of ALL committee draw rooms: new rooms appear instantly,
  // and every status change (drawing → completed) updates live. No refresh.
  useEffect(() => {
    setLoading(true)
    const firstFire = Date.now()
    let hasContent = false

    const unsub = luckyDrawService.listenDrawsByCommittee(committeeId, (list) => {
      hasContent = true
      setDraws(list)
      const latest = list[0] || null
      setActiveDraw((prev) => {
        // Prefer showing a room still in progress over an older completed one
        if (!latest) return null
        if (!prev) return latest
        const prevIsActive = prev.status !== "completed"
        const latestIsActive = latest.status !== "completed"
        if (latestIsActive) return latest
        if (prevIsActive) return prev
        return latest
      })
      // Keep loading spinner only until first snapshot has contents
      if (Date.now() - firstFire > 800 || hasContent) {
        setLoading(false)
      }
    })

    return () => {
      setLoading(false)
      unsub()
    }
  }, [committeeId])

  // Subscribe live to the currently shown room (single doc detail updates)
  useEffect(() => {
    if (!activeDraw?.id) return
    const unsub = luckyDrawService.listenDraw(activeDraw.id, (updated) => {
      if (!updated) return

      // Check if status changed to "completed" and has a winner
      const wasCompleted = previousStatus.current === "completed"
      const isNowCompleted = updated.status === "completed"
      const hasWinner = updated.winnerId && updated.winnerName
      const winnerChanged = previousWinnerId.current !== updated.winnerId

      // Trigger confetti when:
      // 1. Status changes to "completed" AND has a winner
      // 2. Or winner changes (in case of updates)
      if (isNowCompleted && hasWinner && (wasCompleted !== isNowCompleted || winnerChanged)) {
        if (!confettiFired.current) {
          fireConfetti()
          confettiFired.current = true
          // Reset after a few seconds to allow future confetti
          setTimeout(() => {
            confettiFired.current = false
          }, 5000)
        }
      }

      // Update refs
      previousStatus.current = updated.status
      previousWinnerId.current = updated.winnerId || null

      setActiveDraw(updated)
      setDraws((prev) =>
        [updated, ...prev.filter((d) => d.id !== updated.id)].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ),
      )
    })
    return unsub
  }, [activeDraw?.id])

  // Also check for winner changes when activeDraw updates
  useEffect(() => {
    if (activeDraw) {
      const isCompleted = activeDraw.status === "completed"
      const hasWinner = activeDraw.winnerId && activeDraw.winnerName

      // Check if this is a new winner that we haven't fired confetti for
      if (isCompleted && hasWinner && previousWinnerId.current !== (activeDraw.winnerId ?? null)) {
        if (!confettiFired.current) {
          fireConfetti()
          confettiFired.current = true
          setTimeout(() => {
            confettiFired.current = false
          }, 5000)
        }
        previousWinnerId.current = activeDraw.winnerId ?? null
      }
      previousStatus.current = activeDraw.status
    }
  }, [activeDraw])

  const joinDraw = async (draw: LuckyDraw) => {
    const name = guestName.trim()
    if (!name) {
      toast.error("Enter your name to join")
      return
    }
    setJoiningId(draw.id)
    try {
      setGuestName(name)
      const identity = registerIdentity({ name })
      const already = draw.participants.some((p) => p.userId === identity.userId)
      if (draw.status === "waiting" && !already) {
        await luckyDrawService.joinDraw(draw.id, {
          userId: identity.userId,
          name: identity.name,
          joinedAt: new Date(),
        })
        toast.success("You joined the draw!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to join")
    } finally {
      setJoiningId(null)
    }
  }

  const copyLink = async () => {
    const url = `${window.location.origin}/committee-portal?id=${committeeId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Portal link copied!")
    } catch {
      toast.error("Could not copy link")
    }
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const guestId = getGuestId()
  const isJoined = activeDraw?.participants.some((p) => p.userId === guestId) || false

  return (
    <Card className="bg-slate-900/90 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-300">
          <Gift className="h-5 w-5 text-amber-400" />
          Live Lucky Draw
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
          </div>
        ) : activeDraw ? (
          <>
            {/* Active room header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950/70 border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold">{activeDraw.title}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Room Code: {activeDraw.code}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`gap-1.5 border-slate-700 ${activeDraw.status === "completed"
                    ? "text-emerald-400 border-emerald-500/50"
                    : activeDraw.status === "drawing"
                      ? "text-amber-400 border-amber-500/50"
                      : "text-slate-300"
                    }`}
                >
                  <span
                    className={`size-2 rounded-full ${activeDraw.status === "waiting"
                      ? "bg-emerald-500"
                      : activeDraw.status === "drawing"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-purple-500"
                      }`}
                  />
                  {activeDraw.status === "waiting"
                    ? "Open"
                    : activeDraw.status === "drawing"
                      ? "Drawing..."
                      : "Completed"}
                </Badge>
                <Button variant="outline" size="sm" className="text-slate-300" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Link
                </Button>
              </div>
            </div>

            {/* Reel - every member sees the same spin */}
            <div className="flex justify-center py-2">
              <DrawReel draw={activeDraw} dark />
            </div>

            {/* Admin status hint */}
            {activeDraw.status !== "completed" ? (
              <p className="text-center text-xs text-slate-400">
                ⏳ The admin will start the draw here on this portal. Refresh or wait —
                {activeDraw.status === "waiting"
                  ? " the room is open for joining."
                  : " the reel is spinning!"}
              </p>
            ) : (
              <p className="text-center text-xs text-slate-400">
                🏆 Winner declared! See it in the Wall of Fame below.
              </p>
            )}

            {/* Join box (open rooms) */}
            {/* {activeDraw.status === "waiting" && (
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <Input
                  value={guestName}
                  onChange={(e) => setGuestNameLocal(e.target.value)}
                  placeholder="Your name to join"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
                />
                <Button
                  onClick={() => joinDraw(activeDraw)}
                  disabled={joiningId === activeDraw.id || (isJoined && !!activeDraw)}
                  className="h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5"
                >
                  <Play className="h-4 w-4" />
                  {joiningId === activeDraw.id
                    ? "Joining..."
                    : isJoined
                      ? "Joined ✓"
                      : "Join & Watch"}
                </Button>
              </div>
            )} */}

            {/* Participants */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold">Participants</span>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                  {activeDraw.participants.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeDraw.participants.map((p, i) => (
                  <div
                    key={p.userId || i}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${activeDraw.winnerId && activeDraw.winnerId === p.userId
                      ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                      : "border-slate-700 bg-slate-950/60 text-slate-200"
                      }`}
                  >
                    <Avatar className="size-6">
                      <AvatarFallback
                        className={`text-[10px] ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white`}
                      >
                        {initials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {p.name}
                      {p.userId === activeDraw.hostId && (
                        <Crown className="h-3 w-3 text-amber-500 inline ml-1" />
                      )}
                    </span>
                    {activeDraw.winnerId && activeDraw.winnerId === p.userId && (
                      <Trophy className="h-3 w-3 text-amber-400" />
                    )}
                  </div>
                ))}
                {activeDraw.participants.length === 0 && (
                  <span className="text-xs text-slate-500">No participants yet.</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 space-y-2">
            <Gift className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">
              No lucky draw has been started for {committeeName} yet.
            </p>
            <p className="text-xs text-slate-500">
              When the admin spins the draw, the live reel will appear right here for
              everyone.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}