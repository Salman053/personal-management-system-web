"use client"
import { Reminder } from "@/types"
import { Badge } from "@/components/ui/badge"
import { shortDate } from "@/lib/helper"

export default function RemindersWidget({ reminders }: { reminders: Reminder[] }) {
  return (
    <ol className="space-y-3" aria-label="Upcoming Reminders">
      {reminders.map((r) => (
        <li key={r.id || r.title} className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <div className="text-sm font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">{r.type} • {shortDate(r.schedule.dateTime)}</div>
          </div>
          <Badge variant="secondary">{r.priority}</Badge>
        </li>
      ))}
    </ol>
  )
}