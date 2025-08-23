"use client"

interface HabitProgressProps {
  completedDates: string[]
  type: "Maintain" | "Quit" | string
}

export function HabitProgress({ completedDates, type }: HabitProgressProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(today.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const completedSet = new Set(
    completedDates.map((d) => {
      const cd = new Date(d)
      cd.setHours(0, 0, 0, 0)
      return cd.getTime()
    })
  )

  const completedInLast7 = last7Days.filter((d) => completedSet.has(d.getTime())).length

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Last 7 days</span>
        <span>
          {completedInLast7}/7 ({Math.round((completedInLast7 / 7) * 100)}%)
        </span>
      </div>
      <div className="flex gap-1">
        {last7Days.map((date, i) => {
          const isCompleted = completedSet.has(date.getTime())
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm ${
                isCompleted
                  ? type === "Maintain"
                    ? "bg-green-500"
                    : "bg-blue-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
