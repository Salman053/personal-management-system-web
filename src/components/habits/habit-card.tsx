"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  X,
  Edit,
  Trash2,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  MoreVertical,
  Archive,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Habit, HabitStats } from "@/types/index";
import { ActionMenu } from "../ui/action-menu";

interface HabitCardProps {
  habit: Habit;
  completedToday?: boolean;
  stats?: HabitStats;
  onToggle: (habitId: string, date: Date, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onArchive?: (habitId: string, archived: boolean) => void;
}

export function HabitCard({
  habit,
  completedToday,
  stats,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: HabitCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleToggleToday = async () => {
    setIsCompleting(true);
    try {
      onToggle(habit.id, today, !completedToday);
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "expert":
        return "text-red-600 dark:text-red-400";
      case "hard":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-blue-600 dark:text-blue-400";
      case "easy":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "build":
        return <TrendingUp className="w-3 h-3" />;
      case "quit":
        return <X className="w-3 h-3" />;
      case "maintain":
        return <Target className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const currentStreak = stats?.streakData.currentStreak || 0;
  const longestStreak = stats?.streakData.longestStreak || 0;
  const completionRate = stats?.completionRate || 0;

  const getXPReward = () => {
    let baseXP = 10;
    if (habit.difficulty === "hard") baseXP = 20;
    if (habit.difficulty === "expert") baseXP = 30;
    if (habit.priority === "high") baseXP += 5;
    if (habit.priority === "critical") baseXP += 10;
    return baseXP;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      animate={completedToday ? { scale: [1, 1.02, 1] } : {}}
    >
      <Card
        className={cn(
          "h-full hover:shadow-lg transition-all duration-200 border-l-4",
          completedToday && "ring-2 ring-green-200 dark:ring-green-800"
        )}
        style={{ borderLeftColor: habit.color }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{habit.icon}</span>
                <CardTitle className="text-lg leading-tight">
                  {habit.name}
                </CardTitle>
                {completedToday && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-green-600 dark:text-green-400"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      +{getXPReward()} XP
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={getPriorityColor(habit.priority)}
                  variant="secondary"
                >
                  {habit.priority}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeIcon(habit.type)}
                  {habit.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(habit.difficulty)}
                >
                  {habit.difficulty}
                </Badge>
              </div>
            </div>

            <ActionMenu onDelete={onDelete} onEdit={onEdit} item={habit} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {habit.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {habit.description}
            </p>
          )}

          {/* Streak Display */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame
                className={cn(
                  "w-4 h-4",
                  currentStreak > 0
                    ? "text-orange-500"
                    : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-lg font-bold",
                  currentStreak > 0
                    ? "text-orange-500"
                    : "text-muted-foreground"
                )}
              >
                {currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Best: {longestStreak}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">
                {Math.round(completionRate * 100)}%
              </span>
            </div>
            <Progress value={completionRate * 100} className="h-2" />
          </div>

          {/* Today's Action */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Today</span>
              </div>

              <Button
                size="sm"
                variant={completedToday ? "default" : "outline"}
                onClick={handleToggleToday}
                disabled={isCompleting}
                className={cn(
                  "transition-all duration-200",
                  completedToday &&
                    "bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                )}
              >
                {isCompleting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : completedToday ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {habit.type === "quit" ? "Avoided" : "Done"}
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    {habit.type === "quit" ? "Mark Avoided" : "Mark Done"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Category Tag */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {habit.category}
            </Badge>
            {habit.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {currentStreak >= (habit.streakTarget || 7) && (
              <Badge
                variant="outline"
                className="text-xs text-orange-600 dark:text-orange-400"
              >
                <Star className="w-3 h-3 mr-1" />
                Goal Reached!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
