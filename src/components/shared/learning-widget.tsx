// components/LearningWidget.tsx
// =========================
"use client"
import { LearningItem } from "@//types"
import { Progress } from "@/components/ui/progress"

export default function LearningWidget({ items }: { items: LearningItem[] }) {
  const top = items.sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 4)
  return (
    <div className="space-y-3">
      {top.map((l) => (
        <div key={l.id} className="rounded-xl border p-3">
          <div className="text-sm font-medium">{l.title}</div>
          <div className="text-xs text-muted-foreground">{l.tags.join(", ")}</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Progress value={l.progress || 0} className="h-1.5" />
            <span>{l.progress || 0}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}