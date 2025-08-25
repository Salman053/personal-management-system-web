"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  generateReport,
  exportReportData,
  type ReportData,
} from "@/services/reports";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMainContext } from "@/contexts/app-context";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ReportsPage() {
  const { user } = useAuth();
  const { projects, finances, habits, projectPayments, learning } =
    useMainContext();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  console.log(reportData);

  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const loadReport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await generateReport(
        projects,
        projectPayments,
        habits,
        learning,
        finances,
        user?.uid,
        dateRange.from,
        dateRange.to
      );
      setReportData(data);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [user, dateRange]);

  const handleQuickDateRange = (range: string) => {
    const today = new Date();
    switch (range) {
      case "7d":
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case "30d":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case "3m":
        setDateRange({ from: subMonths(today, 3), to: today });
        break;
      case "1y":
        setDateRange({ from: subYears(today, 1), to: today });
        break;
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (reportData) {
      exportReportData(reportData, format);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) return null;

  const overviewCards = [
    {
      title: "Total Revenue",
      value: `$${reportData.projects.revenue.toLocaleString()}`,
      change: reportData.finances.netIncome > 0 ? "+" : "",
      changeValue: `$${Math.abs(
        reportData.finances.netIncome
      ).toLocaleString()}`,
      icon: DollarSign,
      trend: reportData.finances.netIncome > 0 ? "up" : "down",
    },
    {
      title: "Active Projects",
      value: reportData.projects.inProgress.toString(),
      change: "",
      changeValue: `${reportData.projects.total} total`,
      icon: Target,
      trend: "neutral",
    },
    {
      title: "Habits Completion",
      value: `${reportData.habits.averageCompletion.toFixed(1)}%`,
      change: "",
      changeValue: `${reportData.habits.totalHabits} habits`,
      icon: CheckCircle,
      trend: reportData.habits.averageCompletion > 70 ? "up" : "down",
    },
    {
      title: "Learning Progress",
      value: `${reportData.learning.progressPercentage.toFixed(1)}%`,
      change: "",
      changeValue: `${reportData.learning.completedTopics}/${reportData.learning.totalTopics} topics`,
      icon: BookOpen,
      trend: reportData.learning.progressPercentage > 50 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights across all your activities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {["7d", "30d", "3m", "1y"].map((range) => (
              <Button
                key={range}
                variant="outline"
                size="sm"
                onClick={() => handleQuickDateRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>

          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MMM dd")} - ${format(
                      dateRange.to,
                      "MMM dd"
                    )}`
                  : "Pick a date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                    setShowCalendar(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-[120px]">
              <Download className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export CSV</SelectItem>
              <SelectItem value="json">Export JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {card.trend === "up" && (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                )}
                {card.trend === "down" && (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                {card.changeValue}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial Trend</CardTitle>
                <CardDescription>Monthly earnings vs expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.finances.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, ""]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stackId="1"
                      stroke="#00C49F"
                      fill="#00C49F"
                      name="Earnings"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#FF8042"
                      fill="#FF8042"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habits Completion</CardTitle>
                <CardDescription>
                  Daily completion rate over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.habits.completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        format(new Date(value), "MMM dd, yyyy")
                      }
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        "Completion",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion"
                      stroke="#8884D8"
                      strokeWidth={2}
                      dot={{ fill: "#8884D8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.finances.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, ""]} />
                    <Legend />
                    <Bar dataKey="earnings" fill="#00C49F" name="Earnings" />
                    <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current period totals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Earnings</span>
                  <Badge variant="secondary" className="text-green-600">
                    ${reportData.finances.totalEarnings.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <Badge variant="secondary" className="text-red-600">
                    ${reportData.finances.totalExpenses.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Net Income</span>
                  <Badge
                    variant={
                      reportData.finances.netIncome > 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    ${reportData.finances.netIncome.toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completion Trend</CardTitle>
                <CardDescription>30-day habit completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.habits.completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), "dd")}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        "Completion",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion"
                      stroke="#8884D8"
                      strokeWidth={2}
                      dot={{ fill: "#8884D8", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habits Overview</CardTitle>
                <CardDescription>Current statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Habits</span>
                  <Badge variant="secondary">
                    {reportData.habits.totalHabits}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Average Completion
                  </span>
                  <Badge variant="secondary">
                    {reportData.habits.averageCompletion.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Longest Streak</span>
                  <Badge variant="secondary">
                    {reportData.habits.longestStreak} days
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Completed",
                          value: reportData.projects.completed,
                        },
                        {
                          name: "In Progress",
                          value: reportData.projects.inProgress,
                        },
                        {
                          name: "Pending",
                          value:
                            reportData.projects.total -
                            reportData.projects.completed -
                            reportData.projects.inProgress,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent || 0 * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        {
                          name: "Completed",
                          value: reportData.projects.completed,
                        },
                        {
                          name: "In Progress",
                          value: reportData.projects.inProgress,
                        },
                        {
                          name: "Pending",
                          value:
                            reportData.projects.total -
                            reportData.projects.completed -
                            reportData.projects.inProgress,
                        },
                      ].map((entry, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Project financial overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <Badge variant="secondary" className="text-green-600">
                    ${reportData.projects.revenue.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Payments</span>
                  <Badge variant="secondary" className="text-orange-600">
                    ${reportData.projects.pending.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <Badge variant="secondary">
                    {reportData.projects.total > 0
                      ? (
                          (reportData.projects.completed /
                            reportData.projects.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
