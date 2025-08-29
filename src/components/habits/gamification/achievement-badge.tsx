"use client"

import type { Badge, Achievement } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Trophy, Star, Flame, Target, Calendar, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface AchievementBadgeProps {
  badge?: Badge
  achievement?: Achievement
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  calendar: Calendar,
  zap: Zap,
}

export function AchievementBadge({ badge, achievement, size = "md", showProgress = false }: AchievementBadgeProps) {
  const item = badge || achievement
  if (!item) return null

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Trophy
  const isCompleted = badge ? true : achievement?.completed
  const progress = achievement?.progress || 0
  const target = achievement?.target || 1
  const progressPercent = Math.min((progress / target) * 100, 100)

  const sizeClasses = {
    sm: "w-12 h-12 p-2",
    md: "w-16 h-16 p-3",
    lg: "w-20 h-20 p-4",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      <Card
        className={`
          ${sizeClasses[size]} 
          ${
            isCompleted
              ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600"
              : "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
          }
          transition-all duration-300 cursor-pointer
        `}
        style={{ borderColor: isCompleted ? item.color : undefined }}
      >
        <CardContent className="p-0 flex items-center justify-center h-full">
          <IconComponent
            className={`${iconSizes[size]} ${isCompleted ? "text-yellow-600" : "text-gray-400"}`}
            style={{ color: isCompleted ? item.color : undefined }}
          />
        </CardContent>

        {showProgress && achievement && !achievement.completed && (
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </Card>

      {isCompleted && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
          <UIBadge className="bg-green-500 text-white text-xs px-1 py-0">✓</UIBadge>
        </motion.div>
      )}
    </motion.div>
  )
}
