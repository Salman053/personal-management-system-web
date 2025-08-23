"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { habitsService } from "@/services/habits";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { HabitsGrid } from "@/components/habits/habits-grid";
import { HabitCalendar } from "@/components/habits/habit-calendar";
import { HabitsCharts } from "@/components/habits/habits-charts";
import { Plus, Search, Target, TrendingUp, BarChart3 } from "lucide-react";
import { Habit } from "@/types";
import { useModalState } from "@/hooks/use-modal-state";
import { toast } from "sonner";
import { useMainContext } from "@/contexts/app-context";

export default function HabitsPage() {
  const { user } = useAuth();
  const {habits} = useMainContext()
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Maintain" | "Quit">(
    "All"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [habitsData, setHabitsData] = useState<Habit | any>({});
  const { modalState, toggleModal } = useModalState({
    isHabitDialogOpen: false,
  });
  // useEffect(() => {
  //   if (user) {
  //     loadHabits()
  //   }
  // }, [user])

  // const loadHabits = async () => {
  //   if (!user) return

  //   try {
  //     setLoading(true)
  //     const habits = await habitsService.getHabits(user.uid)

  //     // Calculate streaks for each habit
  //     const habitsWithStreaks = habits.map((habit) => ({
  //       ...habit,
  //       streak: habitsService.calculateStreak(habit.completedDates, habit.type),
  //     }))

  //     dispatch({ type: "SET_HABITS", payload: habitsWithStreaks })
  //   } catch (error) {
  //     console.error("Error loading habits:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleCreateHabit = () => {
    setEditingHabit(null);
    setIsDialogOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      await habitsService.deleteHabit(habitId);
      // await loadHabits()
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleHabitSaved = async () => {
    toggleModal("isHabitDialogOpen");
    toast.success("Habit is Created Successfully now can track your habit");
    setEditingHabit(null);
    // await loadHabits()
  };

  // const handleToggleCompletion = async (habitId: string, date: Date, completed: boolean) => {
  //   try {
  //     const habit = state.habits.find((h) => h.id === habitId)
  //     if (!habit) return

  //     const dateString = date.toDateString()
  //     let updatedCompletedDates = [...habit.completedDates]

  //     if (completed) {
  //       // Add the date if not already present
  //       if (!updatedCompletedDates.some((d) => d.toDateString() === dateString)) {
  //         updatedCompletedDates.push(date)
  //       }
  //     } else {
  //       // Remove the date
  //       updatedCompletedDates = updatedCompletedDates.filter((d) => d.toDateString() !== dateString)
  //     }

  //     const newStreak = habitsService.calculateStreak(updatedCompletedDates, habit.type)

  //     await habitsService.updateHabit(habitId, {
  //       completedDates: updatedCompletedDates,
  //       streak: newStreak,
  //     })

  //     await loadHabits()
  //   } catch (error) {
  //     console.error("Error updating habit completion:", error)
  //   }
  // }

  // Filter habits
  // const filteredHabits = state.habits.filter((habit) => {
  //   const matchesSearch =
  //     habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     habit.description.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesType = filterType === "all" || habit.type === filterType
  //   return matchesSearch && matchesType
  // })

  // // Calculate stats
  // const stats = {
  //   total: state.habits.length,
  //   maintain: state.habits.filter((h) => h.type === "maintain").length,
  //   quit: state.habits.filter((h) => h.type === "quit").length,
  //   activeStreaks: state.habits.filter((h) => h.streak > 0).length,
  //   averageStreak:
  //     state.habits.length > 0
  //       ? Math.round(state.habits.reduce((sum, h) => sum + h.streak, 0) / state.habits.length)
  //       : 0,
  // }

  console.log(habits);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Track your daily habits and build lasting routines
          </p>
        </div>
        <Button onClick={() => toggleModal("isHabitDialogOpen")}>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{stats.total}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Maintain Habits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-green-600">{stats.maintain}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quit Habits</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-red-600">{stats.quit}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Streaks
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-blue-600">{stats.activeStreaks}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-purple-600">{stats.averageStreak}</div> */}
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search habits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="maintain">Maintain</option>
                    <option value="quit">Quit</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits Grid */}
          {/* <HabitsGrid
            habits={filteredHabits}
            loading={loading}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
            onToggleCompletion={handleToggleCompletion}
          /> */}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* <HabitCalendar habits={state.habits} onToggleCompletion={handleToggleCompletion} /> */}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* <HabitsCharts habits={state.habits} /> */}
        </TabsContent>
      </Tabs>

      {/* Habit Dialog */}
      <HabitDialog
        open={modalState.isHabitDialogOpen}
        onOpenChange={() => {
          toggleModal("isHabitDialogOpen");
        }}
        habit={editingHabit}
        onSave={handleHabitSaved}
      />
    </div>
  );
}
