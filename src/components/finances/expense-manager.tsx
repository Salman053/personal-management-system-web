"use client";;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, Plus, AlertTriangle } from "lucide-react";
import { FinanceRecord, TransactionType } from "@/types/index";
import { format } from "date-fns";
import { ActionMenu } from "../ui/action-menu";

interface ExpenseManagerProps {
  transactions: FinanceRecord[];
  onEdit: (transaction: FinanceRecord) => void;
  onDelete: (transactionId: string) => void;
  onAdd: (type: TransactionType) => void;
}

export function ExpenseManager({
  transactions,
  onEdit,
  onDelete,
  onAdd,
}: ExpenseManagerProps) {
  const expenseTransactions = transactions.filter((t) => t.type === "Expense");

  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const monthlyExpenses = expenseTransactions
    .filter((t) => {
      const transactionDate = new Date(t.date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
    acc[transaction.category] =
      (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average daily expense this month
  const daysInMonth = new Date().getDate();
  const avgDailyExpense = monthlyExpenses / daysInMonth;

  return (
    <div className="space-y-6">
      {/* Expense Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rs. {totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rs. {monthlyExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: Rs. {avgDailyExpense.toFixed(0)}/day
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Badge variant="secondary">
              {Object.keys(expensesByCategory).length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(expensesByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">Expense categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Expense Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expenses by Category</CardTitle>
            <Button
              onClick={() => onAdd("Expense" as TransactionType)}
              size="sm"
              variant="destructive"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          expenseTransactions.filter(
                            (t) => t.category === category
                          ).length
                        }{" "}
                        transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        Rs. {amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expense Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expense Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead >Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseTransactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 10)
                .map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                
                  >
                    <TableCell>
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {transaction.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.medium}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -Rs. {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        item={transaction}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
