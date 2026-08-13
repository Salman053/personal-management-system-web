"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PartyPopper, Sparkles, Crown } from "lucide-react"
import type { LuckyDraw } from "@/types/lucky-draw"
import { useLuckyDrawReel } from "./use-lucky-draw-reel"
import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

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

function getReelClassName(dark: boolean): string {
  if (dark) return "h-28 rounded-2xl border-2 border-indigo-500/40 bg-slate-900"
  return "h-28 rounded-2xl border-2 border-primary/30 bg-background"
}

function getWinnerClassName(dark: boolean): string {
  if (dark) return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-800"
  return "h-28 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500"
}

export function DrawReel({ draw, size = "lg", dark = false }) {
  const { spinIndex, isSpinning, showReveal } = useLuckyDrawReel(draw)
  const confettiFired = useRef(false)

  const participants = draw?.participants || []
  const reelName = showReveal
    ? draw?.winnerName
    : participants[spinIndex % Math.max(participants.length, 1)]?.name || ""

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const height = size === "sm" ? "h-28" : "h-40"
  const avatarSize = size === "sm" ? "size-12" : "size-16"

  // Tone-based "spin-up" sound using the Web Audio API
  useEffect(() => {
    if (!isSpinning) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 200
      gain.gain.value = 0.1
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
      setTimeout(() => osc.stop(), 500)
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug("Audio not available")
    }
  }, [isSpinning])

  // Celebration confetti when the winner is revealed
  useEffect(() => {
    if (!showReveal || confettiFired.current) return

    const fireConfetti = () => {
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        // Left side confetti
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.5 },
          colors: CONFETTI_COLORS,
          startVelocity: 30,
        })

        // Center burst
        confetti({
          particleCount: 3,
          spread: 70,
          origin: { x: 0.5, y: 0.3 },
          colors: CONFETTI_COLORS,
          startVelocity: 20,
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }

    // Small delay to let the winner animation play first
    const timer = setTimeout(() => {
      fireConfetti()
      confettiFired.current = true
    }, 500)

    return () => {
      clearTimeout(timer)
      // Reset confetti flag after a few seconds
      setTimeout(() => {
        confettiFired.current = false
      }, 5000)
    }
  }, [showReveal])

  const showRevealFinal = draw?.status === "completed" && !!draw?.winnerName

  const reelClassName = getReelClassName(dark)
  const winnerClassName = getWinnerClassName(dark)

  return (
    <div className="relative w-full max-w-sm">
      <AnimatePresence mode="wait">
        {!showRevealFinal ? (
          <motion.div
            key="reel"
            className={`${height} ${reelClassName} flex items-center justify-center`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {participants.length > 0 ? (
              <motion.div
                key={spinIndex}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.15, type: "spring", stiffness: 300 }}
                className="text-center px-4 w-full"
              >
                <Avatar className={`${avatarSize} mx-auto mb-2`}>
                  <AvatarFallback
                    className={`text-lg ${AVATAR_COLORS[spinIndex % AVATAR_COLORS.length]} text-white`}
                  >
                    {initials(participants[spinIndex % participants.length].name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`font-bold text-lg truncate ${dark ? "text-white" : ""}`}>
                  {reelName}
                </div>
              </motion.div>
            ) : (
              <div className={`text-sm text-center ${dark ? "text-slate-400" : "text-muted-foreground"}`}>
                Waiting for participants...
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.8, rotate: -10, opacity: 0, y: 20 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.1
            }}
            className={`${height} ${winnerClassName} flex items-center justify-center relative overflow-hidden`}
          >
            {/* Background celebration particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/20"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: Math.random() * 100 + "%",
                    scale: 0
                  }}
                  animate={{
                    y: ["100%", "-20%"],
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            <div className="text-center px-4 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, -12, 12, -12, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mx-auto w-fit mb-3"
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-white font-black text-4xl drop-shadow-xl">
                  {draw?.winnerName}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 mt-2"
              >
                <Crown className="h-5 w-5 text-amber-300" />
                <span className="text-white/90 text-sm font-semibold uppercase tracking-widest">
                  Winner! 🎉
                </span>
                <Crown className="h-5 w-5 text-amber-300" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle overlay for completed draws */}

    </div>
  )
}