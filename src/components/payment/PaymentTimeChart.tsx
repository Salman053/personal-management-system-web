"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { ProjectPayment } from "@/types";

type Props = {
  payments: ProjectPayment[];
};

export default function PaymentTimelineChart({ payments }: Props) {
  const data = payments
    .map((txn) => ({
      date: txn.date,
      Amount: txn.amount,
      type: txn.type,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ResponsiveContainer className={"py-2 pl-0"} width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" fontSize={14} tickMargin={13} />
        <YAxis fontSize={12} tickMargin={13}/>
        <Tooltip contentStyle={{
          fontSize:12,
          color:"black"
        }} />
        <Line
          type="monotone"
          dataKey="Amount"
          stroke="#4f46e5" // indigo
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
