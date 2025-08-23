"use client"

import { Habit } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import { HabitCard } from "./habit-card"

interface HabitsGridProps {
  habits: Habit[]
  loading: boolean
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onToggleCompletion: (habitId: string, date: Date, completed: boolean) => void
  onArchive: (habitId: string, archived: boolean) => void
}

export function HabitsGrid({
  habits,
  loading,
  onEdit,
  onDelete,
  onToggleCompletion,
  onArchive,
}: HabitsGridProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No habits found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first habit to start building better routines.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        const completedToday = habit.completedDates.some((d) => {
          const date = new Date(d)
          date.setHours(0, 0, 0, 0)
          return date.getTime() === today.getTime()
        })
        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            completedToday={completedToday}
            onToggle={onToggleCompletion}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        )
      })}
    </div>
  )
}
