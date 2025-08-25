"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import type { FinanceRecord } from "@/types/index"
import { ActionMenu } from "../ui/action-menu"

interface TransactionsTableProps {
  transactions: FinanceRecord[]
  loading: boolean
  onEdit: (transaction: FinanceRecord) => void
  onDelete: (transactionId: string) => void
}

export function TransactionsTable({ transactions, loading, onEdit, onDelete }: TransactionsTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "borrowed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "lent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Income":
        return <TrendingUp className="h-4 w-4" />
      case "Expense":
        return <TrendingDown className="h-4 w-4" />
      case "Borrowed":
      case "Lent":
        return <CreditCard className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const formatted = `Rs. ${amount.toLocaleString()}`
    if (type === "Income" || type === "Lent") {
      return `+${formatted}`
    } else if (type === "Expense" || type === "Borrowed") {
      return `-${formatted}`
    }
    return formatted
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground">No transactions found</h3>
            <p className="text-sm text-muted-foreground mt-2">Add your first transaction to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-10">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counter Party</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.counterparty || "----------"}</TableCell>
                <TableCell>{new Date(transaction.date).toDateString()}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(transaction.type)}>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(transaction.type)}
                      {transaction.type}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.medium}</Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-ellipsis" title={transaction.description}>
                    {transaction.description || "---------"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === "Income" || transaction.type === "Lent" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </TableCell>
                <TableCell>
                  <ActionMenu
                    item={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    editLabel="Edit Transaction"
                    deleteLabel="Remove"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
