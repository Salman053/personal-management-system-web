"use client"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/helper";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  trend?: number; // Positive/negative percentage for trend indicator
  icon?: React.ReactNode; // Optional custom icon
  loading?: boolean; // Loading state
}

export function KpiCard({ label, value, hint, trend, icon, loading = false }: KpiCardProps) {
  // Determine trend styling
  const getTrendData = () => {
    if (trend === undefined) return null;
    
    if (trend > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: `+${trend}%`,
        color: "text-green-600"
      };
    } else if (trend < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-500" />,
        text: `${trend}%`,
        color: "text-red-600"
      };
    } else {
      return {
        icon: <Minus className="h-4 w-4 text-gray-500" />,
        text: "0%",
        color: "text-gray-600"
      };
    }
  };

  const trendData = getTrendData();

  return (
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</div>
          {icon && (
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              {icon}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-md animate-pulse mb-2"></div>
        ) : (
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {typeof value === "number" ? formatCurrency(value as number) : value}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {hint && (
            <div className="text-sm text-gray-500">{hint}</div>
          )}
          
          {trendData && (
            <div className={`flex items-center text-sm font-medium ${trendData.color}`}>
              {trendData.icon}
              <span className="ml-1">{trendData.text}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage with different variants
export function KpiCardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <KpiCard 
        label="Total Revenue" 
        value={125600} 
        hint="Last 30 days" 
        trend={12.5}
      />
      <KpiCard 
        label="New Customers" 
        value={245} 
        hint="This month" 
        trend={-3.2}
      />
      <KpiCard 
        label="Conversion Rate" 
        value="18.7%" 
        hint="Website visits" 
        trend={5.8}
      />
      <KpiCard 
        label="Avg. Order Value" 
        value={89.99} 
        hint="Across all products" 
        trend={0}
      />
    </div>
  );
}