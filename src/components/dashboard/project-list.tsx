"use client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, shortDate } from "@/lib/helper"
import { Project } from "@/types"

export default function ProjectList({ projects }: { projects: Project[] }) {
  const statusColor: Record<Project["status"], string> = {
    active: "bg-blue-600",
    completed: "bg-emerald-600",
    paused: "bg-amber-600",
  }
  return (
    <div className="space-y-3" role="list" aria-label="Projects">
      {projects.slice(0, 5).map((p) => (
        <div key={p.id || p.title} role="listitem" className="rounded-xl border p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.clientName} • {shortDate(p.startDate)}{p.endDate ? ` → ${shortDate(p.endDate)}` : ""}</div>
            </div>
            <Badge className={statusColor[p.status]} aria-label={`status ${p.status}`}>{p.status}</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span>{formatCurrency(p.advanceAmount || 0)} / {formatCurrency(p.totalAmount || 0)}</span>
            <Progress value={p.status === "completed" ? 100 : p.status === "active" ? 60 : 20} className="h-1.5" aria-valuemin={0} aria-valuemax={100} />
          </div>
        </div>
      ))}
    </div>
  )
}
