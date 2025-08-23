"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface HabitsChartsProps {
  habits: Habit[];
}

export function HabitsCharts({ habits }: HabitsChartsProps) {
  // Prepare streak data
  const streakData = habits
    .map((habit) => ({
      name:
        habit.title.length > 15
          ? habit.title.substring(0, 15) + "..."
          : habit.title,
      streak: habit.streak.current,
      type: habit.type,
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  // Prepare completion rate data (last 30 days)
  const completionRateData = habits
    .map((habit) => {
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const completedInLast30 = last30Days.filter((date) =>
        habit.completedDates.some((completedDate) => {
          const cd = new Date(completedDate);
          cd.setHours(0, 0, 0, 0);
          return cd.getTime() === date.getTime();
        })
      ).length;

      return {
        name:
          habit.title.length > 15
            ? habit.title.substring(0, 15) + "..."
            : habit.title,
        rate: Math.round((completedInLast30 / 30) * 100),
        type: habit.type,
      };
    })
    .sort((a, b) => b.rate - a.rate);

  // Prepare habit type distribution
  const typeDistribution = [
    {
      name: "Maintain Habits",
      value: habits.filter((h) => h.type === "Maintain").length,
      color: "#00C49F",
    },
    {
      name: "Quit Habits",
      value: habits.filter((h) => h.type === "Quit").length,
      color: "#FF8042",
    },
  ].filter((item) => item.value > 0);

  // Prepare weekly progress data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const totalHabits = habits.length;
    const completedHabits = habits.filter((habit) =>
      habit.completedDates.some((completedDate) => {
        const cd = new Date(completedDate);
        cd.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return cd.getTime() === date.getTime();
      })
    ).length;

    return {
      day: dayName,
      completed: completedHabits,
      total: totalHabits,
      percentage:
        totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
    };
  });

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">
              No data to display
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Start tracking habits to see analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Streaks */}
      <Card>
        <CardHeader>
          <CardTitle>Current Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={streakData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />

              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                cursor={false}
                formatter={(value) => [`${value} days`, "Streak"]}
              />
              <Bar dataKey="streak" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion Rates (Last 30 Days) */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rates (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionRateData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                cursor={false}
                formatter={(value) => [`${value}%`, "Completion Rate"]}
              />
              <Bar dataKey="rate" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Habit Type Distribution */}
      {typeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habit Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent || 0 * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Completion Rate"]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
