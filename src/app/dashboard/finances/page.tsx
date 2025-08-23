"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { transactionsService } from "@/services/transactions"
// import { TransactionDialog } from "@/components/finances/ProjectPaymentDialog"
import { TransactionsTable } from "@/components/finances/transactions-table"
import { FinancialCharts } from "@/components/finances/financial-charts"
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { useMainContext } from "@/contexts/app-context"
import { Transaction } from "@/types"

export default function FinancesPage() {
  const { user } = useAuth()
  const {} = useMainContext()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "Income" | "Expense" | "Borrowed" | "Lent">("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState("overview")


 

  const handleCreateTransaction = (type?: "Income" | "Expense" | "Borrowed" | "Lent") => {
    setEditingTransaction(null)
    setIsDialogOpen(true)
    // If type is provided, we can pass it to the dialog
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    // try {
    //   await transactionsService.deleteTransaction(transactionId)
    //   await loadTransactions()
    // } catch (error) {
    //   console.error("Error deleting transaction:", error)
    // }
  }

  const handleTransactionSaved = async () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    // await loadTransactions()
  }

  // // Filter transactions
  // const filteredTransactions = state.transactions.filter((transaction) => {
  //   const matchesSearch =
  //     transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesType = filterType === "all" || transaction.type === filterType
  //   const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
  //   return matchesSearch && matchesType && matchesCategory
  // })

  // Calculate totals
  // // const totals = {
  // //   income: state.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
  // //   expenses: state.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  // //   borrowed: state.transactions.filter((t) => t.type === "borrowed").reduce((sum, t) => sum + t.amount, 0),
  // //   lent: state.transactions.filter((t) => t.type === "lent").reduce((sum, t) => sum + t.amount, 0),
  // // }

  // const netWorth = totals.income - totals.expenses + totals.lent - totals.borrowed

  // // Get unique categories
  // const categories = Array.from(new Set(state.transactions.map((t) => t.category))).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">Track your income, expenses, and financial health</p>
        </div>
        <Button onClick={() => handleCreateTransaction()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div> */}

      {/* Financial Overview Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.income.toLocaleString()}</div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totals.expenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className={`h-4 w-4 ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netWorth.toLocaleString()}
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totals.borrowed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount you owe</p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lent</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totals.lent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount owed to you</p>
          </CardContent>
        </Card> */}
      {/* </div> */}

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button onClick={() => handleCreateTransaction("income")} className="bg-green-600 hover:bg-green-700">
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Income
            </Button>
            <Button onClick={() => handleCreateTransaction("expense")} className="bg-red-600 hover:bg-red-700">
              <TrendingDown className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button onClick={() => handleCreateTransaction("borrowed")} className="bg-orange-600 hover:bg-orange-700">
              <CreditCard className="mr-2 h-4 w-4" />
              Record Borrowed
            </Button>
            <Button onClick={() => handleCreateTransaction("lent")} className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="mr-2 h-4 w-4" />
              Record Lent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      {/* <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialCharts transactions={state.transactions} />
        </TabsContent> */}

        {/* <TabsContent value="transactions" className="space-y-6"> */}
          {/* Filters */}
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="lent">Lent</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Transactions Table */}
          {/* <TransactionsTable
            transactions={filteredTransactions}
            loading={loading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </TabsContent> */}

        {/* <TabsContent value="analytics" className="space-y-6">
          <FinancialCharts transactions={state.transactions} detailed />
        </TabsContent>
      </Tabs> */}

      {/* Transaction Dialog */}
      {/* <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={editingTransaction}
        onSave={handleTransactionSaved}
      />  */}
    </div>
  )
}
