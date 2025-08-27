import { Timestamp } from "firebase/firestore";
import { FinanceRecord, Habit, LearningItem, Project, ProjectPayment } from "@/types"

export interface ReportData {
  projects: {
    total: number
    completed: number
    inProgress: number
    revenue: number
    pending: number
  }
  finances: {
    totalEarnings: number
    totalExpenses: number
    netIncome: number
    monthlyTrend: Array<{ month: string; earnings: number; expenses: number }>
  }
  habits: {
    totalHabits: number
    averageCompletion: number
    longestStreak: number
    completionTrend: Array<{ date: string; completion: number }>
  }
  learning: {
    totalRoadmaps: number
    completedTopics: number
    totalTopics: number
    progressPercentage: number
  }
}
export async function generateReport(
  projects: Project[],
  projectPayments: ProjectPayment[],
  habits: Habit[],
  learning: LearningItem[],
  finances: FinanceRecord[],
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  const start = Timestamp.fromDate(startDate);
  const end = Timestamp.fromDate(endDate);

  // ---- Projects ----
  const projectsData = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    inProgress: projects.filter((p) => p.status === "active").length,
    revenue: projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    pending: projects.reduce(
      (sum, p) =>
        sum + ((p.totalAmount || 0) - (p.advanceAmount || 0)),
      0
    ),
  };

  // ---- Finances ----
  const earnings = finances.filter((t) => t.type === "Income");
  const expenses = finances.filter((t) => t.type === "Expense");

  const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Monthly trend
  const monthlyData = new Map<
    string,
    { earnings: number; expenses: number }
  >();

  finances.forEach((t) => {
    const date = t.date?.toDate ? t.date.toDate() : new Date(t.date); // Firestore Timestamp or Date
    const month = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    if (!monthlyData.has(month)) {
      monthlyData.set(month, { earnings: 0, expenses: 0 });
    }

    if (t.type === "Income") {
      monthlyData.get(month)!.earnings += t.amount;
    } else if (t.type === "Expense") {
      monthlyData.get(month)!.expenses += t.amount;
    }
  });

  const monthlyTrend = Array.from(monthlyData.entries()).map(
    ([month, data]) => ({
      month,
      earnings: data.earnings,
      expenses: data.expenses,
    })
  );

  // ---- Habits ----
  const completionTrend: Array<{ date: string; completion: number }> = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const completedCount = habits.filter((h) =>
      h.completedDates.includes(dateStr)
    ).length;

    completionTrend.push({
      date: dateStr,
      completion:
        habits.length > 0 ? (completedCount / habits.length) * 100 : 0,
    });
  }

  const habitsData = {
    totalHabits: habits.length,
    averageCompletion:
      completionTrend.reduce((sum, d) => sum + d.completion, 0) /
      (completionTrend.length || 1),
    longestStreak: Math.max(...habits.map((h) => h.streak.longest || 0), 0),
    completionTrend,
  };

  // ---- Learning ----
  const roadmaps = learning.filter((l) => l.type === "roadmap");
  const topics = learning.filter((l) => l.type === "topic");
  const completedTopics = topics.filter((t) => t.completed).length;

  const learningData = {
    totalRoadmaps: roadmaps.length,
    completedTopics,
    totalTopics: topics.length,
    progressPercentage:
      topics.length > 0 ? (completedTopics / topics.length) * 100 : 0,
  };

  return {
    projects: projectsData,
    finances: {
      totalEarnings,
      totalExpenses,
      netIncome: totalEarnings - totalExpenses,
      monthlyTrend,
    },
    habits: habitsData,
    learning: learningData,
  };
}


export async function exportReportData(data: ReportData, format: "csv" | "json") {
  if (format === "csv") {
    const csvContent = [
      "Category,Metric,Value",
      `Projects,Total,${data.projects.total}`,
      `Projects,Completed,${data.projects.completed}`,
      `Projects,Revenue,${data.projects.revenue}`,
      `Finances,Total Earnings,${data.finances.totalEarnings}`,
      `Finances,Total Expenses,${data.finances.totalExpenses}`,
      `Finances,Net Income,${data.finances.netIncome}`,
      `Habits,Total Habits,${data.habits.totalHabits}`,
      `Habits,Average Completion,${data.habits.averageCompletion.toFixed(2)}%`,
      `Learning,Total Roadmaps,${data.learning.totalRoadmaps}`,
      `Learning,Progress,${data.learning.progressPercentage.toFixed(2)}%`,
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}
