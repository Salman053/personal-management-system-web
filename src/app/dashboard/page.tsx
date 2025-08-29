"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Award,
  Moon,
  Sun,
  Activity,
  Briefcase,
  Home,
  Calendar,
  Target,
  Clock,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useMainContext } from "@/contexts/app-context";
import {
  FinanceRecord,
  Habit,
  LearningItem,
  Project,
  ProjectPayment,
  Reminder,
  SubTask,
  Task,
} from "@/types";
import { ProjectTask } from "@/components/task/task-board";
import { useRouter } from "next/navigation";

const COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald / Green
  "#F59E0B", // Amber / Orange
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const {
    loading,
    error,
    projects,
    projectPayments,
    habits,
    finances,
    dailyTaskSubTask,
    dailyTasks,
    learning,
    reminders,
    projectTasks,
  }: {
    loading: boolean;
    error: any;
    projects: Project[];
    projectPayments: ProjectPayment[];
    habits: Habit[];
    finances: FinanceRecord[];
    dailyTaskSubTask: SubTask[];
    dailyTasks: Task[];
    learning: LearningItem[];
    reminders: Reminder[];
    projectTasks: ProjectTask[];
  } = useMainContext(); // Replace with actual user ID

  //

  const analytics = useMemo(() => {
    if (loading) return null;

    // Finance Analytics
    const totalIncome = finances
      .filter((f) => f.type === "Income")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const totalExpenses = finances
      .filter((f) => f.type === "Expense")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const totalLent = finances
      .filter((f) => f.type === "Lent")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const totalBorrowed = finances
      .filter((f) => f.type === "Borrowed")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const netWorth = totalIncome - totalExpenses + totalBorrowed - totalLent;

    // Project Analytics
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length;
    const totalProjectRevenue = projects.reduce(
      (sum, p) => sum + (Number(p.totalAmount) || 0),
      0
    );
    // Sum of all advance amounts
    const totalAdvanceAmount = projects.reduce(
      (sum, p) => sum + (Number(p.advanceAmount) || 0),
      0
    );

    // Sum of all payments made (excluding advance)
    const totalPayments = projectPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    // Combine
    const totalPaidAmount = totalAdvanceAmount + totalPayments;

    // Pending
    const pendingPayments = totalProjectRevenue - totalPaidAmount;
    // Task Analytics (Daily Tasks + Project Tasks)
    const completedDailyTasks = dailyTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const totalDailyTasks = dailyTasks.length;
    const completedProjectTasks = projectTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const totalProjectTasks = projectTasks.length;
    const overallTaskCompletion =
      totalDailyTasks + totalProjectTasks > 0
        ? Math.round(
            ((completedDailyTasks + completedProjectTasks) /
              (totalDailyTasks + totalProjectTasks)) *
              100
          )
        : 0;

    // Habit Analytics
    const avgHabitStreak =
      habits.length > 0
        ? Math.round(
            habits.reduce((sum, h) => sum + (h.streakTarget || 0), 0) /
              habits.length
          )
        : 0;
    const avgCompletionRate =
      habits.length > 0
        ? Math.round(
            habits.reduce((sum, h) => sum + (h.streakTarget || 0), 0) /
              habits.length
          )
        : 0;

    // Learning Analytics
    const avgLearningProgress =
      learning.length > 0
        ? Math.round(
            learning.reduce((sum, l) => sum + (l.progress || 0), 0) /
              learning.length
          )
        : 0;
    const completedLearning = learning.filter((l) => l.completed).length;

    // Monthly Finance Trends (last 6 months)
    const monthlyFinances = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleDateString("en", { month: "short" });

      const monthFinances = finances.filter((f) => {
        const financeDate = new Date(f.date);
        return (
          financeDate.getMonth() === date.getMonth() &&
          financeDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthFinances
        .filter((f) => f.type === "Income")
        .reduce((sum, f) => sum + Number(f.amount), 0);
      const expense = monthFinances
        .filter((f) => f.type === "Expense")
        .reduce((sum, f) => sum + Number(f.amount), 0);

      return {
        month: monthName,
        income,
        expense,
        profit: income - expense,
      };
    });

    // Task Distribution by Type
    const taskDistribution = [
      {
        type: "Daily Tasks",
        count: totalDailyTasks,
        completed: completedDailyTasks,
      },
      {
        type: "Project Tasks",
        count: totalProjectTasks,
        completed: completedProjectTasks,
      },
      {
        type: "Subtasks",
        count: dailyTaskSubTask.length,
        completed: dailyTaskSubTask.filter((s) => s.isCompleted).length,
      },
    ];

    return {
      totalIncome,
      totalExpenses,
      netWorth,
      activeProjects,
      completedProjects,
      totalProjectRevenue,
      pendingPayments,
      overallTaskCompletion,
      avgHabitStreak,
      avgCompletionRate,
      avgLearningProgress,
      completedLearning,
      monthlyFinances,
      taskDistribution,
      totalDailyTasks,
      totalProjectTasks,
      completedDailyTasks,
      completedProjectTasks,
    };
  }, [
    finances,
    projects,
    dailyTasks,
    projectTasks,
    dailyTaskSubTask,
    habits,
    learning,
    loading,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error loading data: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-background p-4 ">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-pretty">
              Comprehensive insights into your productivity and business
              performance
            </p>
          </div>
        </div>

        {/* Key Metrics - Bento Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                PKR {analytics.netWorth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Income: {analytics.totalIncome.toLocaleString()} | Expenses:{" "}
                {analytics.totalExpenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <Briefcase className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.completedProjects} completed | PKR{" "}
                {analytics.pendingPayments.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Task Completion
              </CardTitle>
              <CheckSquare
                className="h-4 w-4"
                style={{ color: "hsl(var(--chart-1))" }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.overallTaskCompletion}%
              </div>
              <p className="text-xs text-muted-foreground">
                Daily: {analytics.completedDailyTasks}/
                {analytics.totalDailyTasks} | Project:{" "}
                {analytics.completedProjectTasks}/{analytics.totalProjectTasks}
              </p>
            </CardContent>
          </Card>

          <Card
            onClick={() => router.push("/dashboard/habit-dashboard")}
            className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Habit Performance
              </CardTitle>
              <Award
                className="h-4 w-4"
                style={{ color: "hsl(var(--chart-4))" }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.avgHabitStreak} days
              </div>
              <p className="text-xs text-muted-foreground">
                Avg streak | {analytics.avgCompletionRate}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Financial Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Financial Trends (Last 6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.monthlyFinances}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ color: "black" }}
                        cursor={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke="hsl(var(--chart-1))"
                        fill={`${COLORS[0]}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stackId="1"
                        stroke="hsl(var(--chart-2))"
                        fill={`${COLORS[3]}`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Task Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.taskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, count }) => `${type}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.taskDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reminders.filter((r) => r.status === "scheduled").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pending reminders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.avgLearningProgress}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg progress | {analytics.completedLearning} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Habits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{habits.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active habits tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Subtasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyTaskSubTask.filter((s) => s.isCompleted).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {dailyTaskSubTask.length} completed
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finances" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyFinances}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        cursor={false}
                        contentStyle={{ color: "black" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="income"
                        fill={`${COLORS[1]}`}
                        name="Income"
                      />
                      <Bar
                        dataKey="expense"
                        fill={`${COLORS[3]}`}
                        name="Expenses"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthlyFinances}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={`hsl(${COLORS[0]})`}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1">
                    PKR {analytics.totalIncome.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-2">
                    PKR {analytics.totalExpenses.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-3">
                    PKR {analytics.totalProjectRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total project value
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-4">
                    PKR {analytics.pendingPayments.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Outstanding amount
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {projects
                .filter((p) => p.type === "client")
                .map((project) => {
                  const projectPaymentsForProject = projectPayments.filter(
                    (pp) => pp.projectId === project.id
                  );

                  const paymentsSum = projectPaymentsForProject.reduce(
                    (sum, pp) => sum + Number(pp.amount),
                    0
                  );

                  const totalPaid =
                    paymentsSum + Number(project.advanceAmount || 0);

                  const progress =
                    Number(project.totalAmount) > 0
                      ? Math.round(
                          (totalPaid / Number(project.totalAmount)) * 100
                        )
                      : 0;

                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <Badge
                            variant={
                              project.status === "active"
                                ? "default"
                                : project.status === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Payment Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span>Total Amount</span>
                              <div className="font-medium text-foreground">
                                PKR {project.totalAmount?.toLocaleString() || 0}
                              </div>
                            </div>
                            <div>
                              <span>Paid Amount</span>
                              <div className="font-medium text-foreground">
                                PKR {totalPaid.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>Client: </span>
                            <span className="font-medium text-foreground">
                              {project.clientName}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {habits.map((habit) => (
                <Card key={habit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                      <Badge
                        variant={
                          habit.type === "maintain" ? "default" : "destructive"
                        }
                      >
                        {habit.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Current Streak
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {habit.unit || 0} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Longest Streak
                        </span>
                        <span className="text-lg font-semibold text-muted-foreground">
                          {habit.unit || 0} days
                        </span>
                      </div>
                      {/* <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{habit. || 0}%</span>
                        </div>
                        <Progress
                          value={habit.completionRate || 0}
                          className="h-2"
                        />
                      </div> */}
                      <div className="text-sm text-muted-foreground">
                        <span>Frequency: </span>
                        <span className="font-medium text-foreground capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <div className="grid gap-4">
              {learning?.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={item.completed ? "default" : "destructive"}
                        >
                          {item.completed ? "Completed" : "Pending"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Category: {item.type}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{item.progress || 0}%</span>
                        </div>
                        <Progress value={item.progress || 0} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Estimated Time
                          </span>
                          <div className="font-medium">
                            {item.estimatedTime || 0} hours
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Actual Time
                          </span>
                          <div className="font-medium">
                            {item.actualTime || 0} hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {analytics.taskDistribution.map((taskGroup, index) => {
                const completionRate =
                  taskGroup.count > 0
                    ? Math.round((taskGroup.completed / taskGroup.count) * 100)
                    : 0;
                const IconComponent =
                  taskGroup.type === "Daily Tasks"
                    ? Home
                    : taskGroup.type === "Project Tasks"
                      ? Briefcase
                      : CheckSquare;

                return (
                  <Card key={taskGroup.type}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {taskGroup.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {taskGroup.completed}/{taskGroup.count}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Completed
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completion Rate</span>
                            <span>{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Tasks */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Daily Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dailyTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.status === "completed" ? "default" : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Project Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {projectTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.status === "completed" ? "default" : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
