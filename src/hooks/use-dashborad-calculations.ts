"use client"
import { FinanceRecord, Habit, LearningItem, Project, Reminder } from "@/types"
import { useMemo } from "react"

export type DashboardInput = {
  finance: FinanceRecord[]
  projects: Project[]
  habits: Habit[]
  learning: LearningItem[]
  reminders: Reminder[]
}

export function useDashboard(data: DashboardInput) {
  /**
   * Why this hook?
   * - Keeps page lean: heavy calculations are memoized.
   * - Reusable for other pages (reports, analytics).
   * - Central place to evolve business logic (DRY, SOLID – Single Responsibility).
   */
  return useMemo(() => {
    const { finance, projects, habits, learning, reminders } = data

    // ---- Finance aggregations ----
    const toMonthKey = (d: any) => {
      const dt = new Date(d)
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
    }

    const sums = {
      income: 0,
      expense: 0,
      borrowed: 0,
      lent: 0,
    }

    const monthlyMap = new Map<string, { income: number; expense: number }>()
    const categoryExpenseMap = new Map<string, number>()

    const outstandingLoans = { receivable: 0, payable: 0, overdue: 0 }

    finance?.forEach((t) => {
      const type = t.type
      const amt = t.amount
      if (type === "Income") sums.income += amt
      if (type === "Expense") {
        sums.expense += amt
        const key = String(t.category)
        categoryExpenseMap.set(key, (categoryExpenseMap.get(key) || 0) + amt)
      }
      if (type === "Borrowed") sums.borrowed += amt
      if (type === "Lent") sums.lent += amt

      if (type === "Income" || type === "Expense") {
        const mk = toMonthKey(t.date)
        const current = monthlyMap.get(mk) || { income: 0, expense: 0 }
        if (type === "Income") current.income += amt
        if (type === "Expense") current.expense += amt
        monthlyMap.set(mk, current)
      }

      // Loans due
      if ((type === "Borrowed" || type === "Lent") && t.dueDate) {
        const due = new Date(t.dueDate)
        const now = new Date()
        const isOverdue = due < now && (t.status === "Pending" || !t.status)
        if (type === "Lent") {
          outstandingLoans.receivable += amt
          if (isOverdue) outstandingLoans.overdue += amt
        } else if (type === "Borrowed") {
          outstandingLoans.payable += amt
          if (isOverdue) outstandingLoans.overdue += amt
        }
      }
    })

    const netProfit = sums.income - sums.expense
    const burnRate = sums.expense / Math.max(1, new Set(finance?.map((f) => toMonthKey(f.date))).size)
    const runwayMonths = sums.income > 0 ? (sums.income / Math.max(1, burnRate)) : 0

    const cashflowSeries = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, v]) => ({ month, income: v.income, expense: v.expense, net: v.income - v.expense }))

    const expenseByCategory = Array.from(categoryExpenseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, value]) => ({ category, value }))

    // ---- Projects ----
    const projectStats = {
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
      paused: projects.filter((p) => p.status === "paused").length,
      totalValue: projects.reduce((s, p) => s + (p.totalAmount || 0), 0),
      advanceCollected: projects.reduce((s, p) => s + (p.advanceAmount || 0), 0),
      progressPct: projects.length
        ? Math.round((projects.filter((p) => p.status === "completed").length / projects.length) * 100)
        : 0,
    }

    // ---- Habits ----
    const habitStats = {
      total: habits.length,
      active: habits.filter((h) => !h.archived).length,
      currentStreaks: habits.sort((a, b) => b.streak.current - a.streak.current).slice(0, 3),
      avgCompletionRate: habits.length ? Math.round(habits.reduce((s, h) => s + (h.stats.completionRate || 0), 0) / habits.length) : 0,
    }

    // ---- Learning ----
    const learningStats = {
      total: learning.length,
      completed: learning.filter((l) => l.completed).length,
      avgProgress: learning.length ? Math.round(learning.reduce((s, l) => s + (l.progress || 0), 0) / learning.length) : 0,
      dueSoon: learning.filter((l) => l.dueDate && new Date(l.dueDate) < new Date(Date.now() + 7 * 86400000)).length,
    }

    // ---- Reminders ----
    const upcomingReminders = reminders
      .filter((r) => r.status !== "cancelled")
      .sort((a, b) => new Date(a.schedule.dateTime).getTime() - new Date(b.schedule.dateTime).getTime())
      .slice(0, 6)

    // ---- Accessibility-friendly summary strings ----
    const ariaSummary = {
      finance: `Income ${sums.income}, Expense ${sums.expense}, Net ${netProfit}`,
      projects: `Projects active ${projectStats.active}, completed ${projectStats.completed}`,
      habits: `Average habit completion ${habitStats.avgCompletionRate} percent`,
      learning: `Learning items ${learningStats.total}, average progress ${learningStats.avgProgress} percent`,
    }

    return {
      sums,
      netProfit,
      burnRate,
      runwayMonths: Math.round(runwayMonths * 10) / 10,
      cashflowSeries,
      expenseByCategory,
      outstandingLoans,
      projectStats,
      habitStats,
      learningStats,
      upcomingReminders,
      ariaSummary,
    }
  }, [data])
}
