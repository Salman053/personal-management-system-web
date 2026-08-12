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
  Activity,
  Briefcase,
  Home,
  Calendar,
  Target,
  Clock,
} from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

const chartTooltipStyle = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

const formatPKR = (value: number) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const {
    loading,
    error,
    projects,
    projectPayments,
    habits,
    habitEntries,
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
    habitEntries: any[];
    finances: FinanceRecord[];
    dailyTaskSubTask: SubTask[];
    dailyTasks: Task[];
    learning: LearningItem[];
    reminders: Reminder[];
    projectTasks: ProjectTask[];
  } = useMainContext(); // Replace with actual user ID

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
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    const totalProjectRevenue = projects.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const totalAdvanceAmount = projects.reduce((sum, p) => sum + (Number(p.advanceAmount) || 0), 0);
    const totalPayments = projectPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPaidAmount = totalAdvanceAmount + totalPayments;
    const pendingPayments = totalProjectRevenue - totalPaidAmount;

    // Task Analytics
    const completedDailyTasks = dailyTasks?.filter((t) => t.status === "completed").length;
    const totalDailyTasks = dailyTasks?.length;
    const completedProjectTasks = projectTasks.filter((t) => t.status === "completed").length;
    const totalProjectTasks = projectTasks?.length;
    const overallTaskCompletion =
      totalDailyTasks + totalProjectTasks > 0
        ? Math.round(((completedDailyTasks + completedProjectTasks) / (totalDailyTasks + totalProjectTasks)) * 100)
        : 0;

    // Habit Analytics (derived from the habit log so it works with real data)
    const entryDate = (e: any) => e?.date?.toDate?.() || new Date(e.date);
    const isToday = require("date-fns").isToday as (d: Date) => boolean;
    const completedToday = habitEntries.filter((e) => e.completed && isToday(entryDate(e))).length;
    const totalCompleted = habitEntries.filter((e) => e.completed).length;
    const avgCompletionRate = habits.length > 0 ? Math.min(100, Math.round((totalCompleted / Math.max(1, habits.length * 14)) * 100)) : 0;

    // Learning Analytics
    const avgLearningProgress =
      learning.length > 0 ? Math.round(learning.reduce((sum, l) => sum + (l?.progress || 0), 0) / learning.length) : 0;
    const completedLearning = learning?.filter((l) => l?.completed).length;

    // Monthly Finance Trends (last 6 months)
    const monthlyFinances = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleDateString("en", { month: "short" });

      const monthFinances = finances.filter((f) => {
        const financeDate = new Date(f.date);
        return (
          financeDate.getMonth() === date.getMonth() && financeDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthFinances.filter((f) => f.type === "Income").reduce((sum, f) => sum + Number(f.amount), 0);
      const expense = monthFinances.filter((f) => f.type === "Expense").reduce((sum, f) => sum + Number(f.amount), 0);

      return { month: monthName, income, expense, profit: income - expense };
    });

    // Task Distribution by Type
    const taskDistribution = [
      { type: "Daily Tasks", count: totalDailyTasks, completed: completedDailyTasks },
      { type: "Project Tasks", count: totalProjectTasks, completed: completedProjectTasks },
      { type: "Subtasks", count: dailyTaskSubTask.length, completed: dailyTaskSubTask.filter((s) => s.isCompleted).length },
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
      completedToday,
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
  }, [finances, projects, dailyTasks, projectTasks, dailyTaskSubTask, habits, habitEntries, learning, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error loading data: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights into your productivity and business performance."
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Worth"
          value={`PKR ${formatPKR(analytics.netWorth)}`}
          hint={`Income ${formatPKR(analytics.totalIncome)} · Expenses ${formatPKR(analytics.totalExpenses)}`}
          icon={<DollarSign className="h-5 w-5" />}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          label="Active Projects"
          value={analytics.activeProjects}
          hint={`${analytics.completedProjects} completed · PKR ${formatPKR(analytics.pendingPayments)} pending`}
          icon={<Briefcase className="h-5 w-5" />}
          tone="bg-accent/10 text-accent"
        />
        <StatCard
          label="Task Completion"
          value={`${analytics.overallTaskCompletion}%`}
          hint={`Daily ${analytics.completedDailyTasks}/${analytics.totalDailyTasks} · Project ${analytics.completedProjectTasks}/${analytics.totalProjectTasks}`}
          icon={<CheckSquare className="h-5 w-5" />}
          tone="bg-chart-1/10 text-chart-1"
        />
        <StatCard
          label="Habit Performance"
          value={`${analytics.completedToday}/${habits.length}`}
          hint={`Completed today · ${analytics.avgCompletionRate}% avg`}
          icon={<Award className="h-5 w-5" />}
          tone="bg-chart-4/10 text-chart-4"
          onClick={() => router.push("/dashboard/habit-dashboard")}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Trends (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyFinances ?? []}>
                    <defs>
                      <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[3]} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={COLORS[3]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={false} />
                    <Area type="monotone" dataKey="income" stroke={COLORS[0]} fill="url(#incomeFill)" name="Income" />
                    <Area type="monotone" dataKey="expense" stroke={COLORS[3]} fill="url(#expenseFill)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                      stroke="var(--card)"
                    >
                      {analytics.taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Reminders"
              value={reminders.filter((r) => r.status === "scheduled").length}
              hint="Pending reminders"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              label="Learning"
              value={`${analytics.avgLearningProgress}%`}
              hint={`Avg progress · ${analytics.completedLearning} completed`}
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatCard
              label="Habits"
              value={habits.length}
              hint="Active habits tracked"
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              label="Subtasks"
              value={`${dailyTaskSubTask.filter((s) => s.isCompleted).length}/${dailyTaskSubTask.length}`}
              hint="Completed"
              icon={<Clock className="h-4 w-4" />}
            />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={false} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" fill={COLORS[1]} name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill={COLORS[3]} name="Expenses" radius={[4, 4, 0, 0]} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke={COLORS[0]}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS[0], strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Income" value={`PKR ${formatPKR(analytics.totalIncome)}`} hint="All time" tone="text-chart-1 bg-chart-1/10" />
            <StatCard label="Total Expenses" value={`PKR ${formatPKR(analytics.totalExpenses)}`} hint="All time" tone="text-chart-2 bg-chart-2/10" />
            <StatCard label="Project Revenue" value={`PKR ${formatPKR(analytics.totalProjectRevenue)}`} hint="Total project value" tone="text-chart-3 bg-chart-3/10" />
            <StatCard label="Pending Payments" value={`PKR ${formatPKR(analytics.pendingPayments)}`} hint="Outstanding amount" tone="text-chart-4 bg-chart-4/10" />
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects
              .filter((p) => p.type === "client")
              .map((project) => {
                const projectPaymentsForProject = projectPayments.filter((pp) => pp.projectId === project.id);

                const paymentsSum = projectPaymentsForProject.reduce((sum, pp) => sum + Number(pp.amount), 0);
                const totalPaid = paymentsSum + Number(project.advanceAmount || 0);
                const progress = Number(project.totalAmount) > 0 ? Math.round((totalPaid / Number(project.totalAmount)) * 100) : 0;

                return (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"}>
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
                            <div className="font-medium text-foreground">PKR {formatPKR(project.totalAmount || 0)}</div>
                          </div>
                          <div>
                            <span>Paid Amount</span>
                            <div className="font-medium text-foreground">PKR {formatPKR(totalPaid)}</div>
                          </div>
                        </div>
                        {project.clientName && (
                          <div className="text-sm text-muted-foreground">
                            <span>Client: </span>
                            <span className="font-medium text-foreground">{project.clientName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            {projects.filter((p) => p.type === "client").length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No client projects yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => (
              <Card key={habit.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span>{habit.icon}</span>
                      {habit.name}
                    </CardTitle>
                    <Badge variant={habit.type === "maintain" ? "secondary" : "outline"}>{habit.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">{habit.category}</Badge>
                      <Badge variant="outline" className="capitalize">{habit.priority}</Badge>
                      <Badge variant="outline" className="capitalize">{habit.frequency}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {habits.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No habits tracked yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid gap-4">
            {learning?.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.completed ? "default" : "outline"}>
                        {item.completed ? "Completed" : item.type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{item.progress || 0}%</span>
                      </div>
                      <Progress value={item.progress || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!learning || learning.length === 0) && (
              <p className="py-8 text-center text-sm text-muted-foreground">No learning items yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {analytics.taskDistribution.map((taskGroup, index) => {
              const completionRate = taskGroup.count > 0 ? Math.round((taskGroup.completed / taskGroup.count) * 100) : 0;
              const IconComponent = taskGroup.type === "Daily Tasks" ? Home : taskGroup.type === "Project Tasks" ? Briefcase : CheckSquare;

              return (
                <Card key={taskGroup.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
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
                        <p className="text-sm text-muted-foreground">Completed</p>
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
                    <div key={task.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                      <span className="text-sm font-medium">{task.title}</span>
                      <Badge variant={task.status === "completed" ? "default" : "outline"}>{task.status}</Badge>
                    </div>
                  ))}
                  {dailyTasks.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No daily tasks.</p>}
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
                    <div key={task.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                      <span className="text-sm font-medium">{task.title}</span>
                      <Badge variant={task.status === "completed" ? "default" : "outline"}>{task.status}</Badge>
                    </div>
                  ))}
                  {projectTasks.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No project tasks.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}