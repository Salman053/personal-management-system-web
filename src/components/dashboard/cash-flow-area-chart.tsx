"use client"
import dynamic from "next/dynamic"
const ReAreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false })
const ReArea = dynamic(() => import("recharts").then(m => m.Area), { ssr: false })
const ReCartesian = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false })
const ReXAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false })
const ReYAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false })
const ReTooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false })
import { ResponsiveContainer } from "recharts"

export default function CashflowAreaChart({ data }: { data: { month: string; income: number; expense: number; net: number }[] }) {
  return (
    <div className="h-44 w-full sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        {/* accessible chart */}
        <ReAreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <ReCartesian strokeDasharray="3 3" />
          <ReXAxis dataKey="month" tick={{ fontSize: 12 }} />
          <ReYAxis tick={{ fontSize: 12 }} />
          <ReTooltip wrapperStyle={{ fontSize: 12 }} />
          <ReArea type="monotone" dataKey="income" fillOpacity={0.2} strokeWidth={2} />
          <ReArea type="monotone" dataKey="expense" fillOpacity={0.2} strokeWidth={2} />
          <ReArea type="monotone" dataKey="net" fillOpacity={0.2} strokeWidth={2} />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
