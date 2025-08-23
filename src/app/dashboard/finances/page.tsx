"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { IncomeManager } from "@/components/finances/income-manager"
import { ExpenseManager } from "@/components/finances/expense-manager"
import { LendingManager } from "@/components/finances/lending-manager"
import { TransactionsTable } from "@/components/finances/transactions-table"
import { FinancialCharts } from "@/components/finances/financial-charts"
import { FinanceRecord } from "@/types"
import { useMainContext } from "@/contexts/app-context"
import { AdvancedFilters } from "@/components/finances/advance-filter"

export default function FinancesPage() {
  const {finances} = useMainContext()
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState<any>({
    search: "",
    type: "all",
    category: "all",
    medium: "all",
    dateFilter: { from: null, to: null, year: null },
  })

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return finances.filter((transaction:any) => {
      const matchesSearch =
        !filters.search ||
        transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.counterparty?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesType = filters.type === "all" || transaction.type === filters.type
      const matchesCategory = filters.category === "all" || transaction.category === filters.category
      const matchesMedium = filters.medium === "all" || transaction.medium === filters.medium

      const transactionDate = new Date(transaction.date)
      const matchesDateRange =
        (!filters.dateFilter.from || transactionDate >= filters.dateFilter.from) &&
        (!filters.dateFilter.to || transactionDate <= filters.dateFilter.to)

      const matchesYear = !filters.dateFilter.year || transactionDate.getFullYear() === filters.dateFilter.year

      return matchesSearch && matchesType && matchesCategory && matchesMedium && matchesDateRange && matchesYear
    })
  }, [filters])

  // Calculate totals
  const totals = {
    income: filteredTransactions.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amount, 0),
    expenses: filteredTransactions.filter((t) => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0),
    borrowed: filteredTransactions.filter((t) => t.type === "Borrowed").reduce((sum, t) => sum + t.amount, 0),
    lent: filteredTransactions.filter((t) => t.type === "Lent").reduce((sum, t) => sum + t.amount, 0),
  }

  const netWorth = totals.income - totals.expenses + totals.lent - totals.borrowed

  const handleAddTransaction = () => {
    console.log("Add transaction")
  }

  const handleEditTransaction = (transaction: FinanceRecord) => {
    console.log("Edit transaction:", transaction)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    console.log("Delete transaction:", transactionId)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Financial Manager</h1>
            <p className="text-muted-foreground text-lg">Professional financial tracking and management system</p>
          </div>
          <Button onClick={handleAddTransaction} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs. {totals.income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter((t) => t.type === "Income").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rs. {totals.expenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter((t) => t.type === "Expense").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className={`h-4 w-4 ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
                Rs. {netWorth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current financial position</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lending Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                Rs. {Math.abs(totals.lent - totals.borrowed).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {totals.lent >= totals.borrowed ? "You are owed" : "You owe"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters filters={filters} onFiltersChange={setFilters} transactions={finances} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="lending">Lending</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialCharts transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeManager
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAdd={handleAddTransaction}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseManager
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAdd={handleAddTransaction}
            />
          </TabsContent>

          <TabsContent value="lending" className="space-y-6">
            <LendingManager
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAdd={handleAddTransaction}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsTable
              transactions={filteredTransactions}
              loading={false}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <FinancialCharts transactions={filteredTransactions} detailed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
