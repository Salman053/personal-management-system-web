// components/HabitsWidget.tsx
// =======================
"use client"
import { Habit } from "@/types/index"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const currentStreakOf = (h: Habit) => {
  if (typeof h.streak === "number") return h.streak
  if (h.streak && typeof h.streak === "object") return h.streak.current ?? 0
  return h.stats?.streakData?.currentStreak ?? 0
}

const longestStreakOf = (h: Habit) => {
  if (typeof h.streak === "number") return h.streak
  if (h.streak && typeof h.streak === "object") return h.streak.longest ?? h.streak.longestStreak ?? 0
  return h.stats?.streakData?.longestStreak ?? 0
}

export default function HabitsWidget({ habits }: { habits: Habit[] }) {
  const top = [...habits].sort((a, b) => currentStreakOf(b) - currentStreakOf(a)).slice(0, 4)
  return (
    <ul className="space-y-3" aria-label="Top Habits">
      {top.map((h) => {
        const name = h.title || h.name
        const completionRate = h.stats?.completionRate ?? 0
        return (
          <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">Streak {currentStreakOf(h)} 🔥 • Best {longestStreakOf(h)}</div>
              </div>
            </div>
            <div className="text-xs">{completionRate ? `${Math.round(completionRate * 100)}%` : "—"}</div>
          </li>
        )
      })}
    </ul>
  )
}