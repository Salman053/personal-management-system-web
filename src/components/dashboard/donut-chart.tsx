"use client"
import dynamic from "next/dynamic"
const RePieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false })
const RePie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false })
const ReTooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false })
import { ResponsiveContainer } from "recharts"

export default function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-44 w-full sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <RePie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} />
          <ReTooltip wrapperStyle={{ fontSize: 12 }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  )
}
