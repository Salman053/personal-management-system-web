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
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { FinanceRecord, TransactionType } from "@/types/index";
import { format, isAfter } from "date-fns";
import { ActionMenu } from "../ui/action-menu";

interface LendingManagerProps {
  transactions: FinanceRecord[];
  onEdit: (transaction: FinanceRecord) => void;
  onDelete: (transactionId: string) => void;
  onAdd: (type: TransactionType) => void;
}

export function LendingManager({
  transactions,
  onEdit,
  onDelete,
  onAdd,
}: LendingManagerProps) {
  const lentTransactions = transactions.filter((t) => t.type === "Lent");
  const borrowedTransactions = transactions.filter(
    (t) => t.type === "Borrowed"
  );

  const totalLent = lentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBorrowed = borrowedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Separate by status
  const pendingLent = lentTransactions.filter((t) => t.status !== "Paid");
  const paidLent = lentTransactions.filter((t) => t.status === "Paid");
  const pendingBorrowed = borrowedTransactions.filter(
    (t) => t.status !== "Paid"
  );
  const paidBorrowed = borrowedTransactions.filter((t) => t.status === "Paid");

  // Calculate overdue
  const overdueLent = pendingLent.filter(
    (t) => t.dueDate && isAfter(new Date(), new Date(t.dueDate))
  );
  const overdueBorrowed = pendingBorrowed.filter(
    (t) => t.dueDate && isAfter(new Date(), new Date(t.dueDate))
  );

  const getStatusIcon = (status?: string, dueDate?: string) => {
    if (status === "Paid")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (dueDate && isAfter(new Date(), new Date(dueDate))) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusBadge = (status?: string, dueDate?: string) => {
    if (status === "Paid")
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (dueDate && isAfter(new Date(), new Date(dueDate))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Lending Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rs. {totalLent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingLent.length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Borrowed
            </CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Rs. {totalBorrowed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingBorrowed.length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <CreditCard
              className={`h-4 w-4 ${
                totalLent >= totalBorrowed ? "text-green-600" : "text-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalLent >= totalBorrowed ? "text-green-600" : "text-red-600"
              }`}
            >
              Rs. {Math.abs(totalLent - totalBorrowed).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalLent >= totalBorrowed ? "You are owed" : "You owe"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueLent.length + overdueBorrowed.length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              onClick={() => onAdd("Lent" as TransactionType)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Money Lent
            </Button>
            <Button
              onClick={() => onAdd("Borrowed" as TransactionType)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Money Borrowed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Money Lent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Money Lent (You are owed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counterparty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lentTransactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {transaction.counterparty || "Unknown"}
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      Rs. {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {transaction.dueDate
                        ? format(new Date(transaction.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        transaction.status,
                        transaction.dueDate?.toString()
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.medium}</Badge>
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

      {/* Money Borrowed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Money Borrowed (You owe)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counterparty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowedTransactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onEdit(transaction)}
                  >
                    <TableCell className="font-medium">
                      {transaction.counterparty || "Unknown"}
                    </TableCell>
                    <TableCell className="font-bold text-orange-600">
                      Rs. {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {transaction.dueDate
                        ? format(new Date(transaction.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        transaction.status,
                        transaction.dueDate?.toString()
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.medium}</Badge>
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
