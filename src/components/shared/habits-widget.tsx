// components/HabitsWidget.tsx
// =======================
"use client"
import { Habit } from "@/types/index"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function HabitsWidget({ habits }: { habits: Habit[] }) {
  const top = habits.sort((a, b) => b.streak.current - a.streak.current).slice(0, 4)
  return (
    <ul className="space-y-3" aria-label="Top Habits">
      {top.map((h) => (
        <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{h.title.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{h.title}</div>
              <div className="text-xs text-muted-foreground">Streak {h.streak.current} 🔥 • Best {h.streak.longest}</div>
            </div>
          </div>
          <div className="text-xs">{h.stats.completionRate}%</div>
        </li>
      ))}
    </ul>
  )
}