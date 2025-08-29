"use client"

import { useState } from "react"
import type { Habit } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, TrendingUp, Target, Trash2, Edit, Archive } from "lucide-react"
import { HabitStreak } from "./habit-streak"
import { HabitProgress } from "./habit-weekly-progress"
import { AchievementBadge } from "./gamification/achievement-badge"
import { StreakCelebration } from "./gamification/streak-celebration"
import { motion, AnimatePresence } from "framer-motion"

interface EnhancedHabitCardProps {
  habit: Habit
  completedToday: boolean
  onToggle: (habitId: string, date: Date, completed: boolean) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onArchive: (habitId: string, archived: boolean) => void
}

export function EnhancedHabitCard({
  habit,
  completedToday,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: EnhancedHabitCardProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleToggle = () => {
    const newCompleted = !completedToday
    onToggle(habit.id, today, newCompleted)

    if (newCompleted && habit.streak.current >= 6) {
      setShowCelebration(true)
    }

    if (newCompleted) {
      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 2000)
    }
  }

  const xpGain = completedToday ? 0 : Math.min((habit.streak.current + 1) * 5, 50)
  const level = Math.floor((habit.xp || 0) / 100) + 1

  return (
    <>
      <motion.div layout animate={justCompleted ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.3 }}>
        <Card
          className={`relative border-2 rounded-xl shadow-sm transition-all hover:shadow-md ${
            habit.archived ? "opacity-60" : ""
          } ${justCompleted ? "ring-2 ring-green-400" : ""}`}
          style={{ borderColor: habit.color || "hsl(var(--border))" }}
        >
          {/* XP and Level Badge */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              Lv.{level}
            </Badge>
            {(habit.xp || 0) > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                {habit.xp} XP
              </Badge>
            )}
          </div>

          {/* Header */}
          <CardHeader className="pb-3">
            <div className="space-y-1 flex-1 pr-16">
              <CardTitle className="text-lg leading-tight flex flex-col gap-2">
                <span>{habit.title}</span>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={
                      habit.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : habit.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }
                  >
                    {habit.priority}
                  </Badge>
                  <Badge
                    className={habit.type === "Maintain" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
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
              </CardTitle>
            </div>

            <div className="absolute top-4 right-4 flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => onEdit(habit)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(habit.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onArchive(habit.id, !habit.archived)}>
                <Archive className={`h-4 w-4 ${habit.archived ? "text-orange-500" : ""}`} />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-4">
            {habit.description && <p className="text-sm text-muted-foreground line-clamp-2">{habit.description}</p>}

            {/* Motivation Quote */}
            {habit.motivationQuote && (
              <motion.p
                className="italic text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded"
                animate={
                  justCompleted ? { backgroundColor: ["rgb(239 246 255)", "rgb(187 247 208)", "rgb(239 246 255)"] } : {}
                }
                transition={{ duration: 1 }}
              >
                💡 "{habit.motivationQuote}"
              </motion.p>
            )}

            {/* Achievements */}
            {habit.badges && habit.badges.length > 0 && (
              <div className="flex gap-1">
                {habit.badges.slice(0, 3).map((badge) => (
                  <AchievementBadge key={badge.id} badge={badge} size="sm" />
                ))}
                {habit.badges.length > 3 && (
                  <div className="text-xs text-muted-foreground self-center">+{habit.badges.length - 3} more</div>
                )}
              </div>
            )}

            {/* Streak */}
            <HabitStreak streak={habit.streak} />

            {/* Today Toggle with XP Preview */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Today</span>
                {!completedToday && xpGain > 0 && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    +{xpGain} XP
                  </Badge>
                )}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant={completedToday ? "default" : "outline"}
                  onClick={handleToggle}
                  className={`${
                    completedToday ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:border-green-300"
                  } transition-all duration-200`}
                >
                  <AnimatePresence mode="wait">
                    {completedToday ? (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {habit.type === "Maintain" ? "Done" : "Avoided"}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="incomplete"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {habit.type === "Maintain" ? "Mark Done" : "Mark Avoided"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>

            {/* Weekly Progress */}
            <HabitProgress completedDates={habit.completedDates} type={habit.type} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Celebration */}
      {showCelebration && (
        <StreakCelebration
          streak={habit.streak.current + 1}
          isNewRecord={habit.streak.current + 1 > habit.streak.longest}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  )
}
