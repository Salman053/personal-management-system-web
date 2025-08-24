"use client";
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
import { TrendingUp, Plus, DollarSign } from "lucide-react";
import type { FinanceRecord, TransactionType } from "@/types/index";
import { format } from "date-fns";
import { ActionMenu } from "../ui/action-menu";

interface IncomeManagerProps {
  transactions: FinanceRecord[];
  onEdit: (transaction: FinanceRecord) => void;
  onDelete: (transactionId: string) => void;
  onAdd: (type: TransactionType) => void;
}

export function IncomeManager({
  transactions,
  onEdit,
  onDelete,
  onAdd,
}: IncomeManagerProps) {
  const incomeTransactions = transactions.filter((t) => t.type === "Income");

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = incomeTransactions
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
  const incomeByCategory = incomeTransactions.reduce((acc, transaction) => {
    acc[transaction.category] =
      (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Income Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs. {totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs. {monthlyIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Badge variant="secondary">
              {Object.keys(incomeByCategory).length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(incomeByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">Income sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Income by Category</CardTitle>
            <Button onClick={() => onAdd("Income" as any)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(incomeByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">
                      {
                        incomeTransactions.filter(
                          (t) => t.category === category
                        ).length
                      }{" "}
                      transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      Rs. {amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Income Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Income Transactions</CardTitle>
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
              {incomeTransactions
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
                    <TableCell className="text-right font-medium text-green-600">
                      +Rs. {transaction.amount.toLocaleString()}
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
