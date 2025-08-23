import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

export async function generateReport(userId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const start = Timestamp.fromDate(startDate)
  const end = Timestamp.fromDate(endDate)

  // Projects data
  const projectsQuery = query(
    collection(db, "projects"),
    where("userId", "==", userId),
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
  )
  const projectsSnapshot = await getDocs(projectsQuery)
  const projects = projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const projectsData = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    inProgress: projects.filter((p) => p.status === "in-progress").length,
    revenue: projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    pending: projects.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount || 0), 0),
  }

  // Finances data
  const transactionsQuery = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "desc"),
  )
  const transactionsSnapshot = await getDocs(transactionsQuery)
  const transactions = transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const earnings = transactions.filter((t) => t.type === "earning")
  const expenses = transactions.filter((t) => t.type === "expense")

  const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  // Monthly trend calculation
  const monthlyData = new Map()
  transactions.forEach((t) => {
    const month = new Date(t.date.toDate()).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { earnings: 0, expenses: 0 })
    }
    if (t.type === "earning") {
      monthlyData.get(month).earnings += t.amount
    } else {
      monthlyData.get(month).expenses += t.amount
    }
  })

  const monthlyTrend = Array.from(monthlyData.entries()).map(([month, data]) => ({
    month,
    earnings: data.earnings,
    expenses: data.expenses,
  }))

  // Habits data
  const habitsQuery = query(collection(db, "habits"), where("userId", "==", userId))
  const habitsSnapshot = await getDocs(habitsQuery)
  const habits = habitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const completionTrend = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const completedCount = habits.filter((h) => h.completions && h.completions[dateStr]).length

    completionTrend.push({
      date: dateStr,
      completion: habits.length > 0 ? (completedCount / habits.length) * 100 : 0,
    })
  }

  const habitsData = {
    totalHabits: habits.length,
    averageCompletion: completionTrend.reduce((sum, d) => sum + d.completion, 0) / completionTrend.length,
    longestStreak: Math.max(...habits.map((h) => h.currentStreak || 0), 0),
    completionTrend,
  }

  // Learning data
  const learningQuery = query(collection(db, "learning"), where("userId", "==", userId))
  const learningSnapshot = await getDocs(learningQuery)
  const learning = learningSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const roadmaps = learning.filter((l) => l.type === "roadmap")
  const topics = learning.filter((l) => l.type === "topic")
  const completedTopics = topics.filter((t) => t.completed).length

  const learningData = {
    totalRoadmaps: roadmaps.length,
    completedTopics,
    totalTopics: topics.length,
    progressPercentage: topics.length > 0 ? (completedTopics / topics.length) * 100 : 0,
  }

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
  }
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
