"use client"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MotivationalQuote } from "@/components/dashboard/motivational-quote"
import { Charts } from "@/components/dashboard/charts"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { userProfile } = useAuth()

  const handleAddExpense = () => {
    // TODO: Open expense modal
    console.log("Add expense")
  }

  const handleAddProject = () => {
    // TODO: Open project modal
    console.log("Add project")
  }

  const handleAddHabit = () => {
    // TODO: Open habit modal
    console.log("Add habit")
  }

  const handleAddLearning = () => {
    // TODO: Open learning modal
    console.log("Add learning")
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.displayName?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">Here's an overview of your personal management system.</p>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Quick Actions */}
      <QuickActions
        onAddExpense={handleAddExpense}
        onAddProject={handleAddProject}
        onAddHabit={handleAddHabit}
        onAddLearning={handleAddLearning}
      />

      {/* Charts */}
      <Charts />
    </div>
  )
}
