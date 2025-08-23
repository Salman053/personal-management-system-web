"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMainContext } from "@/contexts/app-context"
import { DollarSign, TrendingUp, TrendingDown, Target, BookOpen, FolderOpen } from "lucide-react"

export function OverviewCards() {
  const { projects } = useMainContext()

  // Calculate totals
  // const totalEarnings = state.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  // const totalExpenses = state.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  // const borrowedAmount = state.transactions.filter((t) => t.type === "borrowed").reduce((sum, t) => sum + t.amount, 0)

  // const activeProjects = state.projects.filter((p) => p.status === "active").length

  // const activeHabits = state.habits.length

  // const learningProgress =
  //   state.learning.length > 0
  //     ? Math.round(state.learning.reduce((sum, item) => sum + item.progress, 0) / state.learning.length)
  //     : 0

  // const cards = [
  //   {
  //     title: "Total Earnings",
  //     value: `$${totalEarnings.toLocaleString()}`,
  //     icon: TrendingUp,
  //     description: "Total income earned",
  //     color: "text-green-600",
  //   },
  //   {
  //     title: "Total Expenses",
  //     value: `$${totalExpenses.toLocaleString()}`,
  //     icon: TrendingDown,
  //     description: "Total amount spent",
  //     color: "text-red-600",
  //   },
  //   {
  //     title: "Borrowed Amount",
  //     value: `$${borrowedAmount.toLocaleString()}`,
  //     icon: DollarSign,
  //     description: "Outstanding dues",
  //     color: "text-orange-600",
  //   },
  //   {
  //     title: "Active Projects",
  //     value: activeProjects.toString(),
  //     icon: FolderOpen,
  //     description: "Projects in progress",
  //     color: "text-blue-600",
  //   },
  //   {
  //     title: "Active Habits",
  //     value: activeHabits.toString(),
  //     icon: Target,
  //     description: "Habits being tracked",
  //     color: "text-purple-600",
  //   },
  //   {
  //     title: "Learning Progress",
  //     value: `${learningProgress}%`,
  //     icon: BookOpen,
  //     description: "Average completion",
  //     color: "text-indigo-600",
  //   },
  // ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[].map((card) => (
        // <Card key={card.title}>
        //   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        //     <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
        //     <card.icon className={`h-4 w-4 ${card.color}`} />
        //   </CardHeader>
        //   <CardContent>
        //     <div className="text-2xl font-bold">{card.value}</div>
        //     <p className="text-xs text-muted-foreground">{card.description}</p>
        //   </CardContent>
        // </Card>
        <h4>asdasd</h4>
      ))}
    </div>
  )
}
