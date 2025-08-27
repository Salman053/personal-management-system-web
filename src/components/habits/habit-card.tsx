"use client";

import { Habit } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, TrendingUp, Target, Trash2, Edit, Archive } from "lucide-react";
import { HabitStreak } from "./habit-streak";
import { HabitProgress } from "./habit-weekly-progress";

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  onToggle: (habitId: string, date: Date, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onArchive: (habitId: string, archived: boolean) => void;
}

export function HabitCard({
  habit,
  completedToday,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: HabitCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card
      key={habit.id}
      className={`relative border-2 rounded-xl shadow-sm transition-all hover:shadow-md ${
        habit.archived ? "opacity-60" : ""
      }`}
      style={{ borderColor: habit.color || "hsl(var(--border))" }}
    >
      {/* Header */}
      <CardHeader className="pb-3 flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-lg flex-col leading-tight flex  gap-4">
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
                className={
                  habit.type === "Maintain"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
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

        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(habit)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(habit.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onArchive(habit.id, !habit.archived)}
          >
            <Archive
              className={`h-4 w-4 ${habit.archived ? "text-orange-500" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4">
        {habit.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Motivation */}
        {habit.motivationQuote && (
          <p className="italic text-xs text-muted-foreground">
            “{habit.motivationQuote}”
          </p>
        )}

        {/* Streak */}
        <HabitStreak streak={habit.streak} />

        {/* Today Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Today</span>
          <Button
            size="sm"
            variant={completedToday ? "default" : "outline"}
            onClick={() => onToggle(habit.id, today, !completedToday)}
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
        <HabitProgress
          completedDates={habit.completedDates}
          type={habit.type}
        />
      </CardContent>
    </Card>
  );
}
