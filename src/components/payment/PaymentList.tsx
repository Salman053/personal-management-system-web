"use client";

import { Transaction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Props = {
  transactions: Transaction[];
};

export default function PaymentList({ transactions }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {transactions.map((txn) => (
        <Card key={txn.id} className="rounded-2xl shadow hover:shadow-lg transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">{txn.category}</h4>
              <Badge variant={txn.type === "Income" ? "default" : "destructive"}>
                {txn.type}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm">{txn.description}</p>

            <div className="flex justify-between items-center text-sm mt-2">
              <span>{txn.medium}</span>
              <span className="font-semibold">
                {txn.type === "Income" ? "+" : "-"} Rs {txn.amount}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(txn.paidDate), "PPP")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
