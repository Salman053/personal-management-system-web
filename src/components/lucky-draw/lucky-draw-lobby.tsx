"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import {
  Gift,
  Share2,
  Link as LinkIcon,
  Copy,
  Trophy,
  PartyPopper,
  Sparkles,
  Crown,
  Zap,
  Users,
  ArrowLeft,
  Volume2,
  RotateCcw,
} from "lucide-react"
import { luckyDrawService } from "@/services/lucky-draw"
import type { LuckyDraw, LuckyDrawParticipant } from "@/types/lucky-draw"

interface LuckyDrawLobbyProps {
  draw: LuckyDraw
  currentUserId: string
  currentUserName: string
  isHostView: boolean
  onBack?: () => void
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

export function LuckyDrawLobby({
  draw,
  currentUserId,
  currentUserName,
  isHostView,
  onBack,
}: LuckyDrawLobbyProps) {
  const router = useRouter()
  const isHost = draw.hostId === currentUserId
  const isParticipant = draw.participants.some((p) => p.userId === currentUserId)
  const [isJoining, setIsJoining] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const [spinIndex, setSpinIndex] = useState(0)
  const [spinStarted, setSpinStarted] = useState(false)

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/lucky-draw?join=${draw.code}`
      : ""

  // Celebrate on completion
  useEffect(() => {
    if (draw.status === "completed" && draw.winnerName) {
      fireConfetti()
    }
  }, [draw.status, draw.winnerName])

  // Global reel animation: whenever the draw is in "drawing" state,
  // EVERY viewer (host + members + guests) sees names cycling.
  useEffect(() => {
    if (draw.status !== "drawing") {
      setIsSpinning(false)
      return
    }
    const participants = draw.participants
    if (participants.length === 0) return

    setIsSpinning(true)
    setSpinStarted(true)

    // Fast cycling with a slow-down easing so it feels like a real reel
    const totalTime = 4600
    const start = Date.now()
    let lastTick = 0
    let raf = 0
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = elapsed / totalTime
      const interval = 60 + progress * progress * 380
      if (elapsed - lastTick > interval) {
        lastTick = elapsed
        setSpinIndex((i) => (i + 1) % Math.max(participants.length, 1))
      }
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [draw.status, draw.id])

  const handleJoin = async () => {
    if (isParticipant || draw.status !== "waiting") return
    setIsJoining(true)
    try {
      await luckyDrawService.joinDraw(draw.id, {
        userId: currentUserId,
        name: currentUserName,
        joinedAt: new Date(),
      })
      toast.success("You're in the draw!")
    } catch (error: any) {
      toast.error(error.message || "Failed to join draw")
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    try {
      await luckyDrawService.leaveDraw(draw.id, currentUserId)
      toast.info("You left the draw")
    } catch (error) {
      toast.error("Failed to leave draw")
    }
  }

  const copyToClipboard = async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success(kind === "code" ? "Room code copied!" : "Invite link copied!")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

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
    if (draw.participants.length < 2) {
      toast.error("Need at least 2 participants to start")
      return
    }
    await luckyDrawService.startDraw(draw.id)

    // The host waits for the global spin (~4.6s), then resolves the winner
    setTimeout(async () => {
      const participants = draw.participants
      const winner = participants[Math.floor(Math.random() * participants.length)]
      await luckyDrawService.completeDraw(draw.id, winner)
      router.refresh()
    }, 4800)
  }

  const handleReset = async () => {
    await luckyDrawService.resetDraw(draw.id)
    toast.success("Draw reset! Ready for another round.")
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const showReveal = draw.status === "completed" && !!draw.winnerName
  const reelName = showReveal
    ? draw.winnerName
    : draw.participants[spinIndex % Math.max(draw.participants.length, 1)]?.name || ""

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`gap-1.5 ${
              draw.status === "completed"
                ? "border-emerald-400 text-emerald-600 dark:text-emerald-400"
                : draw.status === "drawing"
                  ? "border-amber-400 text-amber-600 dark:text-amber-400"
                  : ""
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                draw.status === "waiting"
                  ? "bg-emerald-500"
                  : draw.status === "drawing"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-purple-500"
              }`}
            />
            {draw.status === "waiting"
              ? "Open"
              : draw.status === "drawing"
                ? "Drawing..."
                : "Completed"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Title + code + share */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{draw.title}</h2>
                    {draw.prize && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        Prize: {draw.prize}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {initials(draw.hostName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 font-medium">
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                      Host
                    </div>
                    <div className="text-muted-foreground">{draw.hostName}</div>
                  </div>
                </div>
              </div>

              {/* Room code */}
              <div className="rounded-xl border-2 border-dashed border-primary/40 p-4 bg-primary/5 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Share this room
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="font-mono text-3xl font-black tracking-[0.3em] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {draw.code}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(draw.code, "code")}
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
                    {copied === "link" ? "Copied!" : "Copy Invite Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = encodeURIComponent(shareLink)
                      const text = encodeURIComponent(
                        `🎁 You're invited to "${draw.title}" lucky draw! Join with code: ${draw.code}`,
                      )
                      window.open(`https://wa.me/?text=${text}%0A${url}`, "_blank")
                    }}
                    className="gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Friends can join instantly — no account needed. Just open the
                link or enter the code.
              </p>
            </CardContent>
          </Card>

          {/* Draw machine */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
              <CardContent className="py-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  The Draw Machine
                </div>

                {/* Reel */}
                <div className="relative w-full max-w-sm">
                  <AnimatePresence mode="wait">
                    {!showReveal ? (
                      <motion.div
                        key="reel"
                        className="h-40 rounded-2xl border-2 border-primary/30 bg-background flex items-center justify-center overflow-hidden relative"
                      >
                        {draw.participants.length > 0 ? (
                          <motion.div
                            key={spinIndex}
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -40, opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="text-center px-4"
                          >
                            <Avatar className="size-16 mx-auto mb-2">
                              <AvatarFallback
                                className={`text-lg ${AVATAR_COLORS[spinIndex % AVATAR_COLORS.length]}`}
                              >
                                {initials(
                                  draw.participants[spinIndex % draw.participants.length].name,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-lg truncate">{reelName}</div>
                          </motion.div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            No participants yet
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="winner"
                        initial={{ scale: 0.4, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="h-40 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="text-center px-4 relative">
                          <motion.div
                            animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.8 }}
                            className="mx-auto w-fit mb-1"
                          >
                            <PartyPopper className="h-8 w-8 text-white" />
                          </motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <div className="text-white font-black text-2xl drop-shadow-md">
                              {draw.winnerName}
                            </div>
                          </motion.div>
                          <div className="text-white/90 text-sm font-semibold uppercase tracking-widest mt-1">
                            🏆 Winner! 🎉
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Indicator lights */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`size-2 rounded-full ${
                          isSpinning ? "bg-amber-400 animate-pulse" : "bg-primary/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {isHost && isHostView ? (
                    <>
                      <Button
                        size="lg"
                        onClick={handleStartDraw}
                        disabled={draw.participants.length < 2 || isSpinning}
                        className="gap-2 gradient-primary rounded-full px-8"
                      >
                        {isSpinning ? (
                          <>
                            <Volume2 className="h-5 w-5 animate-pulse" />
                            Drawing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            Start Draw
                          </>
                        )}
                      </Button>
                      {draw.status === "completed" && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          className="gap-2 rounded-full"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Play Again
                        </Button>
                      )}
                    </>
                  ) : draw.status === "completed" && draw.winnerName ? (
                    <div className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Trophy className="h-5 w-5" />
                      Winner: {draw.winnerName}
                    </div>
                  ) : isSpinning ? (
                    <div className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Volume2 className="h-5 w-5 animate-pulse" />
                      Drawing...
                    </div>
                  ) : (
                    <Button size="lg" disabled className="gap-2 rounded-full">
                      Waiting for host...
                    </Button>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Participants */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Participants</h3>
                </div>
                <Badge variant="secondary">{draw.participants.length}</Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {draw.participants.map((p, i) => (
                  <div
                    key={p.userId || i}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                      draw.winnerId && draw.winnerId === p.userId
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                        : "bg-muted/40"
                    }`}
                  >
                    <Avatar className="size-9">
                      <AvatarFallback
                        className={`text-xs ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white`}
                      >
                        {initials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-1.5">
                        {p.name}
                        {p.userId === draw.hostId && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                        {p.userId === currentUserId && (
                          <span className="text-xs text-muted-foreground">(you)</span>
                        )}
                      </div>
                    </div>
                    {draw.winnerId && draw.winnerId === p.userId && (
                      <Trophy className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                ))}

                {draw.participants.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No participants yet.
                  </div>
                )}
              </div>

              <div className="mt-4">
                {!isParticipant && draw.status === "waiting" ? (
                  <Button
                    className="w-full gap-2"
                    onClick={handleJoin}
                    disabled={isJoining || draw.status !== "waiting"}
                  >
                    <Gift className="h-4 w-4" />
                    {isJoining ? "Joining..." : "Join This Draw"}
                  </Button>
                ) : (
                  isParticipant &&
                  !isHost &&
                  draw.status === "waiting" && (
                    <Button variant="outline" className="w-full" onClick={handleLeave}>
                      Leave Draw
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}