"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, DollarSign, FolderPlus, Target, BookOpen } from "lucide-react"

interface QuickActionsProps {
  onAddExpense: () => void
  onAddProject: () => void
  onAddHabit: () => void
  onAddLearning: () => void
}

export function QuickActions({ onAddExpense, onAddProject, onAddHabit, onAddLearning }: QuickActionsProps) {
  const actions = [
    {
      title: "Add Expense",
      description: "Record a new expense",
      icon: DollarSign,
      onClick: onAddExpense,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Add Project",
      description: "Start a new project",
      icon: FolderPlus,
      onClick: onAddProject,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Add Habit",
      description: "Track a new habit",
      icon: Target,
      onClick: onAddHabit,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Add Learning",
      description: "Start learning something new",
      icon: BookOpen,
      onClick: onAddLearning,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              onClick={action.onClick}
              className={`h-auto p-4 flex flex-col items-start gap-2 ${action.color} text-white`}
            >
              <div className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-xs opacity-90">{action.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
