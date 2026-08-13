"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { luckyDrawService } from "@/services/lucky-draw"
import type { LuckyDraw, LuckyDrawParticipant } from "@/types/lucky-draw"
import type { CommitteeMember } from "@/types/committee"
import { DrawReel } from "@/components/lucky-draw/draw-reel"
import { registerIdentity } from "@/lib/lucky-draw-guest"
import {
  Sparkles,
  Trophy,
  Copy,
  Link as LinkIcon,
  Share2,
  Zap,
  RotateCcw,
  Users,
  Crown,
} from "lucide-react"

interface CommitteeDrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committeeId: string
  committeeName: string
  monthNumber: number
  currency: string
  totalPoolAmount: number
  eligibleMembers: CommitteeMember[]
  onWinnerConfirmed: (winnerMember: CommitteeMember) => Promise<void>
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

export function CommitteeDrawDialog({
  open,
  onOpenChange,
  committeeId,
  committeeName,
  monthNumber,
  currency,
  totalPoolAmount,
  eligibleMembers,
  onWinnerConfirmed,
}: CommitteeDrawDialogProps) {
  const [draw, setDraw] = useState<LuckyDraw | null>(null)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [savingWinner, setSavingWinner] = useState(false)
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const hasInitialized = useRef(false)

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/committee-portal?id=${committeeId}`
      : ""

  // Create (or reuse) the committee-linked room and subscribe live
  useEffect(() => {
    if (!open || hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      setLoading(true)
      try {
        registerIdentity({ name: "Admin" })
        const room = await luckyDrawService.createCommitteeDraw({
          committeeId,
          monthNumber,
          committeeName,
          currency,
          potAmount: totalPoolAmount,
          members: eligibleMembers.map((m) => ({
            id: m.id,
            name: m.name,
            phone: m.phone,
          })),
        })
        setDraw(room)
      } catch (error) {
        console.error(error)
        toast.error("Failed to set up the lucky draw room")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [open, committeeId, monthNumber, committeeName, currency, totalPoolAmount, eligibleMembers])

  // Realtime subscription so admin sees the same state as all viewers
  useEffect(() => {
    if (!draw?.id) return
    const unsub = luckyDrawService.listenDraw(draw.id, (updated) => {
      if (updated) setDraw(updated)
    })
    return unsub
  }, [draw?.id])

  const fireConfetti = () => {
    const duration = 3500
    const end = Date.now() + duration
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: CONFETTI_COLORS })
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: CONFETTI_COLORS })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  const handleStartDraw = async () => {
    if (!draw || starting) return
    if (draw.participants.length < 2) {
      toast.error("Need at least 2 eligible members to start")
      return
    }
    setStarting(true)
    try {
      await luckyDrawService.startDraw(draw.id)
      // Wait for the global spin (~4.6s), then resolve the winner
      setTimeout(async () => {
        const participants = draw.participants
        const winner = participants[Math.floor(Math.random() * participants.length)]
        await luckyDrawService.completeDraw(draw.id, winner)
        setStarting(false)
      }, 4800)
    } catch (error) {
      console.error(error)
      setStarting(false)
      toast.error("Failed to start draw")
    }
  }

  // Record the winner back into the committee payout history
  const handleConfirmWinner = async () => {
    if (!draw?.winnerId) return
    setSavingWinner(true)
    try {
      const memberId = draw.winnerId.replace('member_', '')
      const winnerMember = eligibleMembers.find((m) => m.id === memberId)
      if (winnerMember) {
        await onWinnerConfirmed(winnerMember)
        fireConfetti()
        toast.success(`${winnerMember.name} is the Month ${monthNumber} winner!`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to record winner")
    } finally {
      setSavingWinner(false)
    }
  }

  const handleReset = async () => {
    if (!draw) return
    await luckyDrawService.resetDraw(draw.id)
    toast.success("Draw reset! Ready for another round.")
  }

  const copyToClipboard = async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success(kind === "code" ? "Room code copied!" : "Portal link copied!")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const showReveal = draw?.status === "completed" && !!draw?.winnerName

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 ring-4 ring-amber-500/30 text-amber-500 mb-2">
            <Trophy className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-extrabold">
            Month {monthNumber} Lucky Draw
          </DialogTitle>
          <DialogDescription>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {currency} {totalPoolAmount.toLocaleString()}
            </span>{" "}
            prize pool · {eligibleMembers.length} eligible members
          </DialogDescription>
        </DialogHeader>

        {loading && !draw ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Setting up the room...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Share room */}
            <div className="rounded-xl border-2 border-dashed border-primary/40 p-4 bg-primary/5 text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Members watch live on the portal — no login needed
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="font-mono text-2xl font-black tracking-[0.3em] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {draw?.code}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(draw?.code || "", "code")}
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "code" ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareLink, "link")}
                  className="gap-1.5"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {copied === "link" ? "Copied!" : "Copy Portal Link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `🎁 ${committeeName} — Month ${monthNumber} lucky draw is live! Watch the winner live: ${shareLink}`,
                    )
                    window.open(`https://wa.me/?text=${text}`, "_blank")
                  }}
                  className="gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Reel — all viewers see the same spin */}
            <div className="flex flex-col items-center gap-4">
              <DrawReel draw={draw} />
            </div>

            {/* Status + controls */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`gap-1.5 ${draw?.status === "completed"
                    ? "border-emerald-400 text-emerald-600 dark:text-emerald-400"
                    : draw?.status === "drawing"
                      ? "border-amber-400 text-amber-600 dark:text-amber-400"
                      : ""
                    }`}
                >
                  <span
                    className={`size-2 rounded-full ${draw?.status === "waiting"
                      ? "bg-emerald-500"
                      : draw?.status === "drawing"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-purple-500"
                      }`}
                  />
                  {draw?.status === "waiting"
                    ? "Open"
                    : draw?.status === "drawing"
                      ? "Drawing..."
                      : "Completed"}
                </Badge>
              </div>

              {!showReveal ? (
                <Button
                  size="lg"
                  onClick={handleStartDraw}
                  disabled={starting || (draw?.participants.length || 0) < 2}
                  className="gap-2 gradient-primary rounded-full px-8"
                >
                  {starting ? (
                    <>
                      <Zap className="h-5 w-5 animate-pulse" />
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Start Draw
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2 rounded-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Play Again
                  </Button>
                  <Button
                    onClick={handleConfirmWinner}
                    disabled={savingWinner}
                    className="gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    <Trophy className="h-4 w-4" />
                    {savingWinner ? "Recording..." : "Confirm Winner & Record Payout"}
                  </Button>
                </div>
              )}
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Eligible Members</span>
                <Badge variant="secondary">{draw?.participants.length}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {(draw?.participants || []).map((p, i) => (
                  <div
                    key={p.userId || i}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${draw?.winnerId && draw.winnerId === p.userId
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                      : "bg-muted/40"
                      }`}
                  >
                    <Avatar className="size-7">
                      <AvatarFallback
                        className={`text-[10px] ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white`}
                      >
                        {initials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium truncate flex-1">{p.name}</span>
                    {draw?.winnerId && draw.winnerId === p.userId && (
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}