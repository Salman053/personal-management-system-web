"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Trophy,
  Flame,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import type { HabitAnalytics, Habit } from "@/types/index";
import { cn } from "@/lib/utils";

interface HabitAnalyticsViewProps {
  analytics: HabitAnalytics;
  habits: Habit[];
}

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

export function HabitAnalyticsView({
  analytics,
  habits,
}: HabitAnalyticsViewProps) {
  const completionRateColor =
    analytics.averageCompletionRate >= 0.8
      ? "text-success"
      : analytics.averageCompletionRate >= 0.6
        ? "text-warning"
        : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                <div>
                  <div className="text-2xl font-bold">
                    {analytics.activeHabits}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Habits
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-5 h-5", completionRateColor)} />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(analytics.averageCompletionRate * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. Completion
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-info" />
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
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Progress</span>
                  <span className="font-medium">
                    {Math.round(analytics.weeklyProgress * 100)}%
                  </span>
                </div>
                <Progress
                  value={analytics.weeklyProgress * 100}
                  className="h-3"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Progress</span>
                  <span className="font-medium">
                    {Math.round(analytics.monthlyProgress * 100)}%
                  </span>
                </div>
                <Progress
                  value={analytics.monthlyProgress * 100}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Streak Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.streakLeaderboard.slice(0, 5).map((item, index) => (
                  <div
                    key={item.habit.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.habit.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.habit.category}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-orange-500" />
                      {item.streak}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category} (${count})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Completion by Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value) => [value, "Completions"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="completions"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Habits */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-success" />
                Top Performing Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingHabits.map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                  >
                    <div className="text-2xl">{habit.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {habit.category}
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      Excellent
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Struggling Habits */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-warning" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.strugglingHabits.map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="text-2xl">{habit.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {habit.category}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-warning text-warning"
                    >
                      Focus Needed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mood Correlation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Mood vs Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.moodCorrelation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mood"
                    tickFormatter={(mood) => `😊`.repeat(mood)}
                  />
                  <YAxis
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${Math.round(Number(value) * 100)}%`,
                      "Completion Rate",
                    ]}
                    labelFormatter={(mood) =>
                      `Mood: ${"😊".repeat(Number(mood))}`
                    }
                  />
                  <Bar
                    dataKey="completionRate"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
