"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, Flame, Target } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types/index"

interface HabitCalendarProps {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: Date, completed: boolean) => void
}

export function HabitCalendar({ habits, onToggleCompletion }: HabitCalendarProps) {
  const [selectedHabit, setSelectedHabit] = useState<string>(habits[0]?.id || "")
  const [currentDate, setCurrentDate] = useState(new Date())

  const selectedHabitData = habits.find((h) => h.id === selectedHabit)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Mock completion data - replace with actual logic
  const isDateCompleted = (date: Date) => {
    if (!selectedHabitData) return false
    // Mock: random completion for demo
    return Math.random() > 0.6
  }

  const handleDateClick = (date: Date) => {
    if (!selectedHabitData) return

    const completed = isDateCompleted(date)
    onToggleCompletion(selectedHabitData.id, date, !completed)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No habits to display</h3>
              <p className="text-sm text-muted-foreground mt-2">Create some habits first to see the calendar view.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mock streak calculation
  const currentStreak = Math.floor(Math.random() * 15) + 1
  const completionRate = Math.random() * 0.4 + 0.6

  return (
    <div className="space-y-6">
      {/* Habit Selection and Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Habit Calendar
              </CardTitle>
              <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a habit" />
                </SelectTrigger>
                <SelectContent>
                  {habits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center gap-2">
                        <span>{habit.icon}</span>
                        <span>{habit.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Habit Stats */}
        {selectedHabitData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-habit-streak" />
                  <span className="text-sm">Current Streak</span>
                </div>
                <Badge className="bg-habit-streak text-white">{currentStreak} days</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm">Completion Rate</span>
                </div>
                <Badge variant="secondary">{Math.round(completionRate * 100)}%</Badge>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{selectedHabitData.icon}</span>
                  <div>
                    <div className="font-medium">{selectedHabitData.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {selectedHabitData.category} • {selectedHabitData.type}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-semibold">{monthYear}</h3>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-3">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-3" />
              }

              const isCompleted = isDateCompleted(date)
              const isToday = date.getTime() === today.getTime()
              const isFuture = date > today

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: isFuture ? 1 : 1.05 }}
                  whileTap={{ scale: isFuture ? 1 : 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-12 w-full p-0 text-sm relative transition-all duration-200",
                      isCompleted &&
                        selectedHabitData?.type === "build" &&
                        "bg-success/20 text-success hover:bg-success/30",
                      isCompleted && selectedHabitData?.type === "quit" && "bg-info/20 text-info hover:bg-info/30",
                      isCompleted &&
                        selectedHabitData?.type === "maintain" &&
                        "bg-primary/20 text-primary hover:bg-primary/30",
                      !isCompleted && "hover:bg-muted",
                      isToday && "ring-2 ring-primary ring-offset-2",
                      isFuture && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => !isFuture && handleDateClick(date)}
                    disabled={isFuture}
                  >
                    {date.getDate()}
                    {isCompleted && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full animate-pulse" />
                    )}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          {selectedHabitData && (
            <div className="flex items-center justify-center gap-6 pt-6 border-t text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded",
                    selectedHabitData.type === "build" && "bg-success",
                    selectedHabitData.type === "quit" && "bg-info",
                    selectedHabitData.type === "maintain" && "bg-primary",
                  )}
                />
                <span>
                  {selectedHabitData.type === "build" && "Completed"}
                  {selectedHabitData.type === "quit" && "Avoided"}
                  {selectedHabitData.type === "maintain" && "Maintained"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted border" />
                <span>Not completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary" />
                <span>Today</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
