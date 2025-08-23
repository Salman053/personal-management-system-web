"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceRecord } from "@/types/index"
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

interface FinancialChartsProps {
  transactions: FinanceRecord[]
  detailed?: boolean
}

export function FinancialCharts({ transactions, detailed = false }: FinancialChartsProps) {
  // Prepare monthly data
  const monthlyData = transactions.reduce(
    (acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0, borrowed: 0, lent: 0 }
      }
      acc[month][transaction.type] += transaction.amount
      return acc
    },
    {} as Record<string, { month: string; income: number; expenses: number; borrowed: number; lent: number }>,
  )

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12) // Last 12 months

  // Prepare expense categories data
  const expensesByCategory = transactions
    .filter((t) => t.type === "Expense")
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const expenseCategoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8) // Top 8 categories

  // Prepare income categories data
  const incomeByCategory = transactions
    .filter((t) => t.type === "Income")
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const incomeCategoryData = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Prepare net worth trend
  const netWorthData = monthlyChartData.map((month) => ({
    month: month.month,
    netWorth: month.income - month.expenses + month.lent - month.borrowed,
    cumulative: 0, // Will be calculated below
  }))

  // Calculate cumulative net worth
  let cumulative = 0
  netWorthData.forEach((data) => {
    cumulative += data.netWorth
    data.cumulative = cumulative
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent || 0 * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <>
          {/* Net Worth Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Cumulative Net Worth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeCategoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Borrowing vs Lending */}
          <Card>
            <CardHeader>
              <CardTitle>Borrowing vs Lending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Bar dataKey="borrowed" fill="#FF8042" name="Borrowed" />
                  <Bar dataKey="lent" fill="#0088FE" name="Lent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Net Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Net Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Line type="monotone" dataKey="netWorth" stroke="#8884d8" strokeWidth={2} name="Monthly Net Flow" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
