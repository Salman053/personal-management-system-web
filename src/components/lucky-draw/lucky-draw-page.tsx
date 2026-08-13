"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { luckyDrawService } from "@/services/lucky-draw"
import type { LuckyDraw } from "@/types/lucky-draw"
import { LuckyDrawLobby } from "./lucky-draw-lobby"
import { registerIdentity } from "@/lib/lucky-draw-guest"
import {
  Gift,
  Plus,
  Users,
  Copy,
  Ticket,
  Sparkles,
  Trophy,
  PartyPopper,
} from "lucide-react"

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

export function LuckyDrawPage() {
  const { user, userProfile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeDraw, setActiveDraw] = useState<LuckyDraw | null>(null)
  const [myDraws, setMyDraws] = useState<LuckyDraw[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [prize, setPrize] = useState("")
  const [creating, setCreating] = useState(false)

  const currentUserId = user?.uid || ""
  const currentUserName = userProfile?.displayName || user?.displayName || "Guest"

  // Register identity so the service can stamp hosted draws
  useEffect(() => {
    if (!currentUserId) return
    registerIdentity({ userId: currentUserId, name: currentUserName })
  }, [currentUserId, currentUserName])

  const loadMyDraws = useCallback(async () => {
    if (!currentUserId) return
    try {
      const draws = await luckyDrawService.getMyDraws(currentUserId)
      setMyDraws(draws)
    } catch (error) {
      console.error("Failed to load draws", error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    loadMyDraws()
  }, [loadMyDraws])

  // Realtime lobby subscription
  useEffect(() => {
    if (!activeDraw?.id) return
    const unsub = luckyDrawService.listenDraw(activeDraw.id, (draw) => {
      if (!draw) {
        setActiveDraw(null)
        return
      }
      setActiveDraw(draw)
    })
    return unsub
  }, [activeDraw?.id])

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }
    setCreating(true)
    try {
      const draw = await luckyDrawService.createDraw({
        title: title.trim(),
        prize: prize.trim() || undefined,
      })
      setCreateOpen(false)
      setTitle("")
      setPrize("")
      toast.success(`Draw "${draw.title}" created! Share the code: ${draw.code}`)
      setActiveDraw(draw)
      loadMyDraws()
    } catch (error) {
      toast.error("Failed to create draw")
    } finally {
      setCreating(false)
    }
  }

  const handleJoinByCode = async () => {
    const code = joinCode.trim()
    if (!code) {
      toast.error("Enter a room code")
      return
    }
    setJoinLoading(true)
    try {
      const draw = await luckyDrawService.getDrawByCode(code)
      if (!draw) {
        toast.error("No draw found with that code")
        return
      }
      if (draw.status === "completed") {
        toast.error("This draw has already finished")
        return
      }
      setActiveDraw(draw)
      setJoinCode("")
    } catch (error) {
      toast.error("Failed to join draw")
    } finally {
      setJoinLoading(false)
    }
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const statusBadge = (status: string) => {
    if (status === "waiting")
      return (
        <Badge variant="outline" className="border-emerald-400 text-emerald-600 dark:text-emerald-400 gap-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Open
        </Badge>
      )
    if (status === "drawing")
      return (
        <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400 gap-1">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          Drawing
        </Badge>
      )
    return (
      <Badge variant="outline" className="border-purple-400 text-purple-600 dark:text-purple-400 gap-1">
        <Trophy className="size-3" />
        {status === "completed" ? "Completed" : "Finished"}
      </Badge>
    )
  }

  const copyLink = async (draw: LuckyDraw) => {
    const link = `${window.location.origin}/lucky-draw?join=${draw.code}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Invite link copied!")
    } catch {
      toast.error("Could not copy invite link")
    }
  }

  return (
    <>
      {activeDraw ? (
        <LuckyDrawLobby
          draw={activeDraw}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isHostView
          onBack={() => {
            setActiveDraw(null)
            loadMyDraws()
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Hero */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Lucky Draw
              </h1>
              <p className="text-muted-foreground">
                Create a room, share the link, and spin to pick a winner — no
                accounts needed
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Create New Draw
            </Button>
          </div>

          {/* Join by code */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Got a code?</div>
                    <div className="text-sm text-muted-foreground">
                      Enter the room code your friend shared
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. 7F3QXK)"
                    className="uppercase font-mono tracking-widest"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                  />
                  <Button onClick={handleJoinByCode} disabled={joinLoading} className="gap-2">
                    {joinLoading ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My draws */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">My Draws</h2>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : myDraws.length === 0 ? (
                <div className="text-center py-14 space-y-3">
                  <div className="mx-auto w-fit p-3 rounded-2xl bg-muted">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    You haven&apos;t created any draws yet.
                  </p>
                  <Button variant="outline" onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create your first draw
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myDraws.map((draw) => (
                    <motion.div
                      key={draw.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                        onClick={() => setActiveDraw(draw)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{draw.title}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                Code: {draw.code}
                              </div>
                            </div>
                            {statusBadge(draw.status)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {draw.participants.length}
                            </span>
                            {draw.prize && (
                              <span className="flex items-center gap-1 min-w-0">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span className="truncate">{draw.prize}</span>
                              </span>
                            )}
                            {draw.status === "completed" && draw.winnerName && (
                              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <PartyPopper className="h-3.5 w-3.5" />
                                {draw.winnerName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {draw.participants.slice(0, 4).map((p, i) => (
                              <Avatar key={p.userId || i} className="size-6">
                                <AvatarFallback
                                  className={`text-[10px] ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white`}
                                >
                                  {initials(p.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {draw.participants.length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{draw.participants.length - 4}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyLink(draw)
                              }}
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy link
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Create a Lucky Draw
            </DialogTitle>
            <DialogDescription>
              You&apos;ll get a room code to share with friends — they can join
              without an account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="draw-title">Draw Title</Label>
              <Input
                id="draw-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Team Lunch Fund Draw"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="draw-prize">Prize (optional)</Label>
              <Input
                id="draw-prize"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g. Free lunch, gift card, bragging rights..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="gradient-primary gap-2">
              {creating ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create & Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}