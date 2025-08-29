"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Target, TrendingUp, Award } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useMainContext } from "@/contexts/app-context";

interface HabitDashboardProps {
  className?: string;
}

export default function HabitDashboard({ className }: HabitDashboardProps) {
  const { habitEntries, userXP, habits } = useMainContext();
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate streaks
  const calculateStreak = (habitId: string) => {
    const filteredEntries = habitEntries
      ?.filter((entry) => entry.habitId === habitId && entry.completed)
      .sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

    let streak = 0;
    let currentDate = new Date();

    for (const entry of filteredEntries) {
      const entryDate = entry.date?.toDate?.() || new Date(entry.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate today's completions
  const todayEntries = habitEntries.filter((entry) => {
    const entryDate = entry.date?.toDate?.() || new Date(entry.date);
    return isToday(entryDate) && entry.completed;
  });

  // Calculate weekly progress
  const weeklyEntries = habitEntries.filter((entry) => {
    const entryDate = entry.date?.toDate?.() || new Date(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd && entry.completed;
  });

  // Calculate total XP
  const totalXP = userXP.reduce((sum, xp) => sum + (xp.amount || 0), 0);
  const todayXP = userXP
    .filter((xp) => {
      const xpDate = xp.createdAt?.toDate?.() || new Date(xp.createdAt);
      return isToday(xpDate);
    })
    .reduce((sum, xp) => sum + (xp.amount || 0), 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Progress
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              of {habits.filter((h) => h.frequency === "daily").length} daily
              habits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Completions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyEntries.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXP}</div>
            <p className="text-xs text-muted-foreground">+{todayXP} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...habits.map((h) => calculateStreak(h.id)), 0)}
            </div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayEntries = habitEntries.filter((entry) => {
                const entryDate =
                  entry.date?.toDate?.() || new Date(entry.date);
                return (
                  format(entryDate, "yyyy-MM-dd") ===
                    format(day, "yyyy-MM-dd") && entry.completed
                );
              });

              const completionRate =
                habits.length > 0
                  ? (dayEntries.length /
                      habits.filter((h) => h.frequency === "daily").length) *
                    100
                  : 0;

              return (
                <div key={day.toISOString()} className="text-center">
                  <div className="text-xs font-medium mb-2">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-sm mb-2">{format(day, "d")}</div>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium",
                      isToday(day) ? "ring-2 ring-primary" : "",
                      completionRate === 100
                        ? "bg-green-500 text-white"
                        : completionRate >= 50
                          ? "bg-yellow-500 text-white"
                          : completionRate > 0
                            ? "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {dayEntries.length}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Habit Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Habit Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.id);
            const todayCompleted = todayEntries.some(
              (entry) => entry.habitId === habit.id
            );
            const weeklyCompletions = weeklyEntries.filter(
              (entry) => entry.habitId === habit.id
            ).length;
            const weeklyTarget =
              habit.frequency === "daily" ? 7 : habit.targetCount || 1;
            const progress = (weeklyCompletions / weeklyTarget) * 100;

            return (
              <div key={habit.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{habit.name}</span>
                    {todayCompleted && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Done today
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    {streak} day streak
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Weekly progress</span>
                    <span>
                      {weeklyCompletions}/{weeklyTarget}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
