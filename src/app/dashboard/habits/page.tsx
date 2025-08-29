"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

export default function HabitsPage() {
  const { habits } = useMainContext();
  // const [habits, setHabits] = useState<Habit[]>([]);
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, analyticsData, quote] = await Promise.all([
        // habitService.getHabits(),
        habitService.getUserProfile(),
        habitService.getHabitAnalytics(),
        habitService.getMotivationalQuote(),
      ]);

      // setHabits(Habits);
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
      const habit = habits.find((h:Habit) => h.id === habitId);
      if (!habit) return;
// console.log(habitId)
      const dateString = date.toISOString().split("T")[0];
      await habitService.markHabitComplete(habitId, dateString, 0, "");

      if (completed) {
        // Award XP for completion
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
          habitId,
        );

        toast.success(`+${xpAmount} XP! ${habit.name} completed!`, {
          description: xpResult.levelUp
            ? `🎉 Level up! You're now level ${xpResult.newLevel}!`
            : undefined,
        });
      }

      // Reload data to reflect changes
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-muted-foreground">
            Build lasting habits and achieve your goals with data-driven
            insights
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* <div className="text-right">
              <div className="text-sm text-muted-foreground">Level {userProfile.level}</div>
              <div className="flex items-center gap-2">
                <Progress value={(userProfile.currentXP / userProfile.xpToNextLevel) * 100} className="w-24 h-2" />
                <span className="text-sm font-medium">
                  {userProfile.currentXP}/{userProfile.xpToNextLevel} XP
                </span>
              </div>
            </div> */}
          <Button
            onClick={() => setIsHabitDialogOpen(true)}
            className="gradient-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>

      {motivationalQuote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <blockquote className="text-lg italic text-foreground">
                "{motivationalQuote.text}"
              </blockquote>
              <cite className="text-sm text-muted-foreground mt-2 block">
                — {motivationalQuote.author}
              </cite>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics.totalHabits}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Habits
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics.completedToday}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Today
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <BarChart3 className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.averageCompletionRate * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completion Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-habit-streak/10">
                    <Flame className="w-5 h-5 text-habit-streak" />
                  </div>
                  <div>
                    {/* <div className="text-2xl font-bold">{userProfile?.streakCount || 0}</div> */}
                    <div className="text-sm text-muted-foreground">
                      Current Streak
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Star className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    {/* <div className="text-2xl font-bold">{userProfile?.totalXP || 0}</div> */}
                    <div className="text-sm text-muted-foreground">
                      Total XP
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
            <CardContent className="">
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
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="productivity">Productivity</option>
                    <option value="learning">Learning</option>
                    <option value="mindfulness">Mindfulness</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="build">Build</option>
                    <option value="quit">Quit</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HabitCard
                  // completedToday
                  habit={habit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onToggle={handleToggleCompletion}
                />
              </motion.div>
            ))}
          </div>

          {filteredHabits.length === 0 && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No habits found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm ||
                      filterCategory !== "all" ||
                      filterType !== "all"
                        ? "Try adjusting your filters or search terms."
                        : "Create your first habit to get started on your journey."}
                    </p>
                  </div>
                  {!searchTerm &&
                    filterCategory === "all" &&
                    filterType === "all" && (
                      <Button
                        onClick={() => setIsHabitDialogOpen(true)}
                        className="gradient-primary"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Habit
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <HabitCalendar
            habits={habits}
            onToggleCompletion={handleToggleCompletion}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <HabitAnalyticsView analytics={analytics} habits={habits} />
          )}
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
