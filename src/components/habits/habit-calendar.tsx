"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Habit } from "@/contexts/app-context"

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

    const days = []

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

  const isDateCompleted = (date: Date) => {
    if (!selectedHabitData) return false

    return selectedHabitData.completedDates.some((completedDate) => {
      const cd = new Date(completedDate)
      cd.setHours(0, 0, 0, 0)
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return cd.getTime() === d.getTime()
    })
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
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">No habits to display</h3>
            <p className="text-sm text-muted-foreground mt-2">Create some habits first to see the calendar view.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Habit Calendar</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedHabit} onValueChange={setSelectedHabit}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a habit" />
              </SelectTrigger>
              <SelectContent>
                {habits.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2" />
            }

            const isCompleted = isDateCompleted(date)
            const isToday = date.getTime() === today.getTime()
            const isFuture = date > today

            return (
              <Button
                key={index}
                variant="ghost"
                className={`
                  h-10 w-full p-0 text-sm relative
                  ${
                    isCompleted
                      ? selectedHabitData?.type === "maintain"
                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                      : "hover:bg-muted"
                  }
                  ${isToday ? "ring-2 ring-primary" : ""}
                  ${isFuture ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !isFuture && handleDateClick(date)}
                disabled={isFuture}
              >
                {date.getDate()}
                {isCompleted && <div className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full" />}
              </Button>
            )
          })}
        </div>

        {/* Legend */}
        {selectedHabitData && (
          <div className="flex items-center justify-center gap-6 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${selectedHabitData.type === "maintain" ? "bg-green-500" : "bg-blue-500"}`}
              />
              <span>{selectedHabitData.type === "maintain" ? "Completed" : "Avoided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
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
  )
}
