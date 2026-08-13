"use client"

import { useEffect, useState, useRef } from "react"
import type { LuckyDraw } from "@/types/lucky-draw"

/**
 * Shared "reel spin" hook. Whenever the draw flips to status "drawing",
 * every viewer runs the same slot-machine animation locally (names cycle
 * with a slow-down easing). When the draw completes, the reveal shows the
 * persisted winner — identical on all browsers.
 */
export function useLuckyDrawReel(draw: LuckyDraw | null, spinDuration = 4600) {
  const [spinIndex, setSpinIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const keptParticipants = useRef(draw?.participants || [])

  // Keep the participant snapshot used during a spin stable
  useEffect(() => {
    if (!isSpinning) {
      keptParticipants.current = draw?.participants || []
    }
  }, [draw, isSpinning])

  useEffect(() => {
    if (!draw || draw.status !== "drawing") {
      setIsSpinning(false)
      return
    }
    const participants = keptParticipants.current || draw.participants
    if (participants.length === 0) {
      setIsSpinning(false)
      return
    }

    setIsSpinning(true)

    const start = Date.now()
    const totalTime = spinDuration
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

    return () => {
      cancelAnimationFrame(raf)
      setIsSpinning(false)
    }
  }, [draw?.status, draw?.id, spinDuration])

  const showReveal = draw?.status === "completed" && !!draw?.winnerName

  return {
    spinIndex,
    isSpinning,
    showReveal,
  }
}