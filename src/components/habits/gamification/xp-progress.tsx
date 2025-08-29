"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface XPProgressProps {
  currentXP: number
  level: number
  xpToNextLevel: number
  totalXPForNextLevel: number
  recentXPGain?: number
}

export function XPProgress({
  currentXP,
  level,
  xpToNextLevel,
  totalXPForNextLevel,
  recentXPGain = 0,
}: XPProgressProps) {
  const progressPercent = ((totalXPForNextLevel - xpToNextLevel) / totalXPForNextLevel) * 100

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Zap className="h-5 w-5" />
          Level {level}
          {recentXPGain > 0 && (
            <motion.div
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              className="flex items-center gap-1 text-green-600 text-sm"
            >
              <TrendingUp className="h-3 w-3" />+{recentXPGain} XP
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currentXP.toLocaleString()} XP</span>
          <span>{xpToNextLevel} XP to next level</span>
        </div>
        <Progress value={progressPercent} className="h-3 bg-purple-100 dark:bg-purple-900/30" />
        <div className="text-center text-xs text-muted-foreground">
          {Math.round(progressPercent)}% to Level {level + 1}
        </div>
      </CardContent>
    </Card>
  )
}
