"use client"

import { useState, useEffect } from "react"
import type { Habit, HabitEntry, HabitStats } from "@/types/index"
import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import { HabitCard } from "./habit-card"
import { habitService } from "@/services/habits"

interface HabitsGridProps {
  habits: Habit[]
  loading: boolean
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onToggleCompletion: (habitId: string, date: Date, completed: boolean) => void
  onArchive: (habitId: string, archived: boolean) => void
}

export function HabitsGrid({ habits, loading, onEdit, onDelete, onToggleCompletion, onArchive }: HabitsGridProps) {
  const [habitEntries, setHabitEntries] = useState<Record<string, HabitEntry[]>>({})
  const [habitStats, setHabitStats] = useState<Record<string, HabitStats>>({})
  const [loadingEntries, setLoadingEntries] = useState(true)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  useEffect(() => {
    const loadHabitData = async () => {
      if (habits.length === 0) return

      setLoadingEntries(true)
      try {
        const entriesPromises = habits.map((habit) => habitService.getHabitEntries(habit.id))
        const statsPromises = habits.map((habit) => habitService.getHabitStats(habit.id))

        const [entriesResults, statsResults] = await Promise.all([
          Promise.all(entriesPromises),
          Promise.all(statsPromises),
        ])

        const entriesMap: Record<string, HabitEntry[]> = {}
        const statsMap: Record<string, HabitStats> = {}

        habits.forEach((habit, index) => {
          entriesMap[habit.id] = entriesResults[index]
          statsMap[habit.id] = statsResults[index]
        })

        setHabitEntries(entriesMap)
        setHabitStats(statsMap)
      } catch (error) {
        console.error("Failed to load habit data:", error)
      } finally {
        setLoadingEntries(false)
      }
    }

    loadHabitData()
  }, [habits])

  const handleToggleCompletion = async (habitId: string, date: Date, completed: boolean) => {
    const dateStr = date.toISOString().split("T")[0]

    try {
      if (completed) {
        // Mark as complete
        const entry = await habitService.markHabitComplete(habitId, dateStr)
        setHabitEntries((prev) => ({
          ...prev,
          [habitId]: [...(prev[habitId] || []).filter((e) => e.date !== dateStr), entry],
        }))
      } else {
        // Mark as incomplete (remove entry)
        setHabitEntries((prev) => ({
          ...prev,
          [habitId]: (prev[habitId] || []).filter((e) => e.date !== dateStr),
        }))
      }

      // Refresh stats after completion change
      const updatedStats = await habitService.getHabitStats(habitId)
      setHabitStats((prev) => ({
        ...prev,
        [habitId]: updatedStats,
      }))

      // Call parent handler
      await onToggleCompletion(habitId, date, completed)
    } catch (error) {
      console.error("Failed to toggle habit completion:", error)
    }
  }

  if (loading || loadingEntries) {
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
            <h3 className="text-lg font-medium text-muted-foreground">No habits found</h3>
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
        const entries = habitEntries[habit.id] || []
        const todayEntry = entries.find((entry) => entry.date === todayStr)
        const completedToday = todayEntry?.completed || false
        const stats = habitStats[habit.id]

        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            completedToday={completedToday}
            stats={stats}
            onToggle={handleToggleCompletion}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        )
      })}
    </div>
  )
}
