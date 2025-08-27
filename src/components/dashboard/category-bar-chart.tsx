"use client"
import dynamic from "next/dynamic"
const ReBarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false })
const ReBar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false })
const ReXAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false })
const ReYAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false })
const ReTooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false })
import { ResponsiveContainer } from "recharts"

export default function CategoryBarChart({ data }: { data: { category: string; value: number }[] }) {
  return (
    <div className="h-44 w-full sm:h-56">
      <ResponsiveContainer>
        <ReBarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <ReXAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} height={50} />
          <ReYAxis tick={{ fontSize: 12 }} />
          <ReTooltip wrapperStyle={{ fontSize: 12 }} />
          <ReBar dataKey="value" radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
