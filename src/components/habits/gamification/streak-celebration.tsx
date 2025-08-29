"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, Star, Trophy, Zap } from "lucide-react"
import confetti from "canvas-confetti"

interface StreakCelebrationProps {
  streak: number
  isNewRecord?: boolean
  onClose: () => void
}

export function StreakCelebration({ streak, isNewRecord, onClose }: StreakCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const end = Date.now() + duration

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"]

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  const getMilestoneMessage = (streak: number) => {
    if (streak >= 365) return { message: "Incredible! A full year!", icon: Trophy, color: "text-purple-600" }
    if (streak >= 100) return { message: "Century Club!", icon: Trophy, color: "text-gold-600" }
    if (streak >= 50) return { message: "Halfway to 100!", icon: Star, color: "text-blue-600" }
    if (streak >= 30) return { message: "One month strong!", icon: Flame, color: "text-orange-600" }
    if (streak >= 7) return { message: "One week streak!", icon: Zap, color: "text-green-600" }
    return { message: "Great start!", icon: Flame, color: "text-red-600" }
  }

  const milestone = getMilestoneMessage(streak)
  const IconComponent = milestone.icon

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={() => setShow(false)}
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          className="max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-600">
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.6 }}
              >
                <IconComponent className={`h-16 w-16 mx-auto ${milestone.color}`} />
              </motion.div>

              <div className="space-y-2">
                <motion.h2
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {streak} Day Streak! 🔥
                </motion.h2>
                <p className={`text-lg font-medium ${milestone.color}`}>{milestone.message}</p>
                {isNewRecord && (
                  <motion.p
                    className="text-purple-600 font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    🏆 New Personal Record!
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">You're building incredible momentum!</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">+{Math.min(streak * 2, 100)} XP Bonus!</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShow(false)
                  onClose()
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                Keep Going! 💪
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
