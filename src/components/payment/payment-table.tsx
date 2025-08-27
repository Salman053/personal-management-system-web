"use client";;
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { ProjectPayment } from "@/types";
import { ActionMenu } from "../ui/action-menu";

interface PaymentTableProps {
  payments: ProjectPayment[];
  loading: boolean;
  onEdit: (payment: ProjectPayment) => void;
  onDelete: (payment: ProjectPayment) => void;
}

export function PaymentTable({
  payments,
  loading,
  onEdit,
  onDelete,
}: PaymentTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "borrowed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "lent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Income":
        return <TrendingUp className="h-4 w-4" />;
      case "Expense":
        return <TrendingDown className="h-4 w-4" />;
      case "Borrowed":
      case "Lent":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = `Rs. ${amount.toLocaleString()}`;
    if (type === "Income" || type === "Lent") {
      return `+${formatted}`;
    } else if (type === "Expense" || type === "Borrowed") {
      return `-${formatted}`;
    }
    return formatted;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground">
              No Payments found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first payment to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
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
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.date).toDateString()}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(payment.type)}>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(payment.type)}
                      {payment.type}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{payment.medium}</Badge>
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-[200px] truncate"
                    title={payment.description}
                  >
                    {payment.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{payment.category}</Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    payment.type === "Income" || payment.type === "Lent"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatAmount(payment.amount, payment.type)}
                </TableCell>
                <TableCell>
                  
                  <ActionMenu
                    item={payment}
                    onEdit={() => onEdit(payment)}
                    onDelete={() => onDelete(payment)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
