"use client"

import { Flame } from "lucide-react"

interface HabitStreakProps {
  streak: {
    current: number
    longest: number
  }
}

export function HabitStreak({ streak }: HabitStreakProps) {
  const getColor = (streak: number) => {
    if (streak === 0) return "text-gray-500"
    if (streak < 7) return "text-orange-500"
    if (streak < 30) return "text-blue-500"
    return "text-purple-500"
  }

  return (
    <div className="flex items-center gap-2">
      <Flame className={`h-4 w-4 ${getColor(streak.current)}`} />
      <span className={`font-medium ${getColor(streak.current)}`}>
        {streak.current} day{streak.current !== 1 ? "s" : ""} streak
      </span>
      <span className="text-xs text-muted-foreground">(Longest {streak.longest})</span>
    </div>
  )
}
