"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Target, TrendingUp, Check, X, Flame } from "lucide-react"
import { Habit } from "@/types"

interface HabitsGridProps {
  habits: Habit[]
  loading: boolean
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onToggleCompletion: (habitId: string, date: Date, completed: boolean) => void
}

export function HabitsGrid({ habits, loading, onEdit, onDelete, onToggleCompletion }: HabitsGridProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.some((date) => {
      const completedDate = new Date(date)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })
  }

  const handleToggleToday = (habit: Habit) => {
    const completed = isCompletedToday(habit)
    onToggleCompletion(habit.id, today, !completed)
  }

  const getTypeColor = (type: string) => {
    return type === "maintain"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return "text-gray-500"
    if (streak < 7) return "text-orange-500"
    if (streak < 30) return "text-blue-500"
    return "text-purple-500"
  }

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
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">No habits found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first habit to start building better routines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        const completedToday = isCompletedToday(habit)

        return (
          <Card key={habit.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg leading-tight">{habit.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(habit.type)}>
                      {habit.type === "Maintain" ? (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" /> Maintain
                        </>
                      ) : (
                        <>
                          <Target className="h-3 w-3 mr-1" /> Quit
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(habit)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {habit.description && <p className="text-sm text-muted-foreground line-clamp-2">{habit.description}</p>}

              {/* Streak Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className={`h-4 w-4 ${getStreakColor(habit.streak.current)}`} />
                  <span className={`font-medium ${getStreakColor(habit.streak.current)}`}>
                    {habit.streak.current} day{habit.streak.current !== 1 ? "s" : ""} streak
                  </span>
                </div>
              </div>

              {/* Today's Completion */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Today</span>
                <Button
                  size="sm"
                  variant={completedToday ? "default" : "outline"}
                  onClick={() => handleToggleToday(habit)}
                  className={completedToday ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {completedToday ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {habit.type === "Maintain" ? "Done" : "Avoided"}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      {habit.type === "Maintain" ? "Mark Done" : "Mark Avoided"}
                    </>
                  )}
                </Button>
              </div>

              {/* Weekly Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Last 7 days</span>
                  <span>
                    {(() => {
                      const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        date.setHours(0, 0, 0, 0)
                        return date
                      })

                      const completedInLast7 = last7Days.filter((date) =>
                        habit.completedDates.some((completedDate) => {
                          const cd = new Date(completedDate)
                          cd.setHours(0, 0, 0, 0)
                          return cd.getTime() === date.getTime()
                        }),
                      ).length

                      return `${completedInLast7}/7`
                    })()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - i))
                    date.setHours(0, 0, 0, 0)

                    const isCompleted = habit.completedDates.some((completedDate) => {
                      const cd = new Date(completedDate)
                      cd.setHours(0, 0, 0, 0)
                      return cd.getTime() === date.getTime()
                    })

                    return (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${
                          isCompleted
                            ? habit.type === "Maintain"
                              ? "bg-green-500"
                              : "bg-blue-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
