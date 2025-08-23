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
import ConfirmDialog from "@/components/system/confirm-dialog";
import { CustomSelect } from "@/components/shared/custom-select";

export default function HabitsPage() {
  const { habits, loading } = useMainContext();

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Schedule notifications for habits with reminders enabled
  useEffect(() => {
    if (!habits || !Array.isArray(habits)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    habits.forEach((habit: any) => {
      if (habit.reminder?.enabled && habit.reminder?.timeOfDay) {
        // Only schedule for today
        const [hour, minute] = habit.reminder.timeOfDay.split(":").map(Number);
        const reminderTime = new Date(now);
        reminderTime.setHours(hour, minute, 0, 0);
        const msUntilReminder = reminderTime.getTime() - now.getTime();
        if (msUntilReminder > 0 && msUntilReminder < 86400000) {
          setTimeout(() => {
            new Notification(`Habit Reminder: ${habit.title}`, {
              body: habit.description || "It's time for your habit!",
              icon: habit.color || undefined,
            });
          }, msUntilReminder);
        }
      }
    });
    // Cleanup: no need for now, as timeouts are per session
  }, [habits]);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Maintain" | "Quit">(
    "All"
  );
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | string | null>("");
  const [activeTab, setActiveTab] = useState("overview");
  // const [habitsData, setHabitsData] = useState<Habit | any>({});
  const { modalState, toggleModal } = useModalState({
    isHabitDialogOpen: false,
    isHabitDeleteModalOpen: false,
  });

  const habitsWithStreaks = habits.map((habit: any) => ({
    ...habit,
    streak: habitsService.calculateStreak(habit.completedDates),
  }));

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    toggleModal("isHabitDialogOpen");
  };

  const handleDeleteHabit = async () => {
    try {
      await habitsService
        .deleteHabit(habitToDelete as any)
        .then(() => toast.success("Habit deleted successfully"));
      // await loadHabits()
    } catch (error: any) {
      console.error("Error deleting habit:", error);
      toast.error("Error : " + error?.message);
    } finally {
      toggleModal("isHabitDeleteModalOpen");
      setHabitToDelete(null);
    }
  };

  const handleHabitSaved = async () => {
    toggleModal("isHabitDialogOpen");
    setEditingHabit(null);
    // await loadHabits()
  };

  function calculateStats(completedDates: string[], createdAt: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays =
      Math.floor(
        (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const totalCompletions = completedDates.length;
    const missedDays = totalDays - totalCompletions;
    const completionRate =
      totalDays > 0 ? (totalCompletions / totalDays) * 100 : 0;

    return {
      totalCompletions,
      missedDays,
      completionRate: Math.round(completionRate),
    };
  }
  const handleToggleCompletion = async (
    habitId: string,
    date: Date,
    completed: boolean
  ) => {
    try {
      const habit = habits.find((h: any) => h.id === habitId);
      if (!habit) return;

      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
      let updatedCompletedDates = [...habit.completedDates];

      if (completed) {
        if (!updatedCompletedDates.includes(dateString)) {
          updatedCompletedDates.push(dateString);
        }
      } else {
        updatedCompletedDates = updatedCompletedDates.filter(
          (d) => d !== dateString
        );
      }

      // === Recalculate derived values ===
      const { current, longest } = await habitsService.calculateStreak(
        updatedCompletedDates
      );

      const stats = calculateStats(
        updatedCompletedDates,
        habit.createdAt.toDate?.() || new Date(habit.createdAt) // supports Firestore Timestamp
      );

      await habitsService.updateHabit(habitId, {
        completedDates: updatedCompletedDates,
        streak: {
          current,
          longest,
          lastCompleted: completed ? date : null,
        },
        stats,
      });
    } catch (error) {
      console.error("Error updating habit completion:", error);
    }
  };

  // Filter habits by search and type
  const filteredHabits = habits.filter((habit: any) => {
    const matchesSearch =
      habit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "All" ||
      habit.type?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const stats = {
    total: filteredHabits.length,
    maintain: filteredHabits.filter(
      (h: any) => h.type?.toLowerCase() === "maintain"
    ).length,
    quit: filteredHabits.filter((h: any) => h.type?.toLowerCase() === "quit")
      .length,
    activeStreaks: filteredHabits.filter((h: any) => h.streak?.current > 0)
      .length,
    averageStreak:
      filteredHabits.length > 0
        ? Math.round(
            filteredHabits.reduce(
              (sum: number, h: any) => sum + (h.streak?.current || 0),
              0
            ) / filteredHabits.length
          )
        : 0,
  };

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
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <div className="text-2xl font-bold text-green-600">
              {stats.maintain}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quit Habits</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.quit}</div>
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
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeStreaks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageStreak}
            </div>
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
                  <CustomSelect
                    value={filterType}
                    onChange={(v) => setFilterType(v as any)}
                    options={["All", "Maintain", "Quit"]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits Grid */}
          <HabitsGrid
            onArchive={() => null}
            habits={filteredHabits}
            loading={loading}
            onEdit={handleEditHabit}
            onDelete={(habitId) => {
              setHabitToDelete(habitId);
              toggleModal("isHabitDeleteModalOpen");
            }}
            onToggleCompletion={handleToggleCompletion}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <HabitCalendar
            habits={habits}
            onToggleCompletion={handleToggleCompletion}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <HabitsCharts habits={habits} />
        </TabsContent>
      </Tabs>

      {/* Habit Dialog */}
      <HabitDialog
        open={modalState.isHabitDialogOpen}
        onOpenChange={() => {
          toggleModal("isHabitDialogOpen");
        }}
        habit={editingHabit as Habit}
        onSave={handleHabitSaved}
      />
      <ConfirmDialog
        open={modalState.isHabitDeleteModalOpen}
        onCancel={() => {
          toggleModal("isHabitDeleteModalOpen");
          setEditingHabit("");
        }}
        lockWhilePending
        confirmVariant={"destructive"}
        onConfirm={handleDeleteHabit}
      />
    </div>
  );
}
