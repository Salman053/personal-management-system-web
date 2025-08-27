"use client";;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMainContext } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
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
} from "recharts";
import { FinanceRecord, Habit } from "@/types";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function Charts() {
  const { projects, finances, projectPayments, habits, learning } =
    useMainContext();
  const { user } = useAuth();

  // const data  = useDashboardData(
  //   user?.uid as any,
  //   finances,
  //   projects,
  //   projectPayments,
  //   habits,
  //   learning
  // );
  // // Prepare expense data by category
  const expensesByCategory = finances
    .filter((t:FinanceRecord) => t.type === "Expense")
    .reduce(
      (acc: { [x: string]: any; }, transaction: { category: string | number; amount: any; }) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const expenseData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }))

  // // Prepare monthly income vs expenses
  const monthlyData = finances.reduce(
    (acc: { [x: string]: {
      income: number; expenses: any;
      month:any 
}; }, transaction:FinanceRecord) => {
      const month = new Date(transaction.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0 }
      }
      if (transaction.type === "Income") {
        acc[month].income += transaction.amount
      } else if (transaction.type === "Expense") {
        acc[month].expenses += transaction.amount
      }
      return acc
    },
    {} as Record<string, { month: string; income: number; expenses: number }>,
  )

  const monthlyChartData = Object.values(monthlyData).slice(-6) // Last 6 months

  // Prepare habit completion data
  const habitData = habits.map((habit:Habit) => ({
    name: habit.title,
    streak: habit.streak.current,
    completion: Math.min((habit.completedDates.length / 30) * 100, 100), // Last 30 days
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent||0 * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rs. ${value}`, "Amount"]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
              <Tooltip formatter={(value) => [`Rs. ${value}`, ""]} />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Habit Streaks */}
      {habitData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habit Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="streak"
                  fill="#8884D8"
                  name="Current Streak (days)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Learning Progress */}
      {[].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
                <Bar dataKey="progress" fill="#0088FE" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
 }


