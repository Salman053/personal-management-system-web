"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Target,
  TrendingUp,
  BarChart3,
  Flame,
  Trophy,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { HabitCalendar } from "@/components/habits/habit-calendar";
import { Habit, HabitAnalytics } from "@/types";
import { habitService } from "@/services/habits";
import { HabitAnalyticsView } from "@/components/habits/habit-analytics";
import { useMainContext } from "@/contexts/app-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";

const CATEGORY_OPTIONS = [
  "health",
  "fitness",
  "productivity",
  "learning",
  "mindfulness",
  "social",
  "creativity",
  "finance",
  "other",
] as const;

const TYPE_OPTIONS = ["build", "quit", "maintain"] as const;

export default function HabitsPage() {
  const { habits } = useMainContext();
  const [analytics, setAnalytics] = useState<HabitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [motivationalQuote, setMotivationalQuote] = useState<{
    text: string;
    author: string;
  } | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, quote] = await Promise.all([
        habitService.getHabitAnalytics(),
        habitService.getMotivationalQuote(),
      ]);

      setAnalytics(analyticsData);
      setMotivationalQuote(quote);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load habit data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (
    habitId: string,
    date: Date,
    completed: boolean
  ) => {
    try {
      const habit = habits.find((h: Habit) => h.id === habitId);
      if (!habit) return;

      const dateString = date.toISOString().split("T")[0];
      await habitService.markHabitComplete(habitId, dateString, 0, "");

      if (completed) {
        const xpAmount =
          habit.difficulty === "easy"
            ? 10
            : habit.difficulty === "medium"
            ? 20
            : habit.difficulty === "hard"
            ? 30
            : 50;
        const xpResult = await habitService.addXP(
          xpAmount,
          "",
          "habit_completion",
          habitId
        );

        toast.success(`+${xpAmount} XP! ${habit.name} completed!`, {
          description: xpResult.levelUp
            ? `🎉 Level up! You're now level ${xpResult.newLevel}!`
            : undefined,
        });
      }

      await loadData();
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error("Failed to update habit");
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitService.deleteHabit(habitId);
      toast.success("Habit deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit");
    }
  };

  const handleHabitSaved = async () => {
    setIsHabitDialogOpen(false);
    setEditingHabit(null);
    await loadData();
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch =
      habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || habit.category === filterCategory;
    const matchesType = filterType === "all" || habit.type === filterType;
    return matchesSearch && matchesCategory && matchesType && habit.isActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Habit Tracker"
        description="Build lasting habits and achieve your goals with data-driven insights."
        actions={
          <Button onClick={() => setIsHabitDialogOpen(true)} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        }
      />

      {motivationalQuote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <blockquote className="text-lg italic text-foreground">
                "{motivationalQuote.text}"
              </blockquote>
              <cite className="mt-2 block text-sm text-muted-foreground">
                — {motivationalQuote.author}
              </cite>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analytics && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Habits"
            value={analytics.totalHabits}
            icon={<Target className="h-5 w-5" />}
            tone="bg-primary/10 text-primary"
          />
          <StatCard
            label="Completed Today"
            value={analytics.completedToday}
            icon={<TrendingUp className="h-5 w-5" />}
            tone="bg-success/10 text-success"
          />
          <StatCard
            label="Completion Rate"
            value={`${Math.round(analytics.averageCompletionRate * 100)}%`}
            icon={<BarChart3 className="h-5 w-5" />}
            tone="bg-warning/10 text-warning"
          />
          <StatCard
            label="Current Streak"
            value={
              analytics.streakLeaderboard[0]?.streak ?? 0
            }
            icon={<Flame className="h-5 w-5" />}
            tone="bg-habit-streak/10 text-habit-streak"
          />
          <StatCard
            label="Top Habit"
            value={
              analytics.topPerformingHabits[0]?.name?.charAt(0)?.toUpperCase() ??
              "—"
            }
            hint={analytics.topPerformingHabits[0]?.name}
            icon={<Star className="h-5 w-5" />}
            tone="bg-info/10 text-info"
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="overview" className="text-sm font-medium">
            <Target className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-sm font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">
            <Trophy className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
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
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <HabitCard
                  habit={habit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onToggle={handleToggleCompletion}
                />
              </motion.div>
            ))}
          </div>

          {filteredHabits.length === 0 && (
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title="No habits found"
              description={
                searchTerm ||
                filterCategory !== "all" ||
                filterType !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Create your first habit to get started on your journey."
              }
              action={
                (!searchTerm &&
                  filterCategory === "all" &&
                  filterType === "all" && (
                    <Button
                      onClick={() => setIsHabitDialogOpen(true)}
                      className="gradient-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Habit
                    </Button>
                  )) || undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <HabitCalendar habits={habits} onToggleCompletion={handleToggleCompletion} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && <HabitAnalyticsView analytics={analytics} habits={habits} />}
        </TabsContent>
      </Tabs>

      <HabitDialog
        open={isHabitDialogOpen}
        onOpenChange={setIsHabitDialogOpen}
        habit={editingHabit}
        onSave={handleHabitSaved}
      />
    </div>
  );
}