import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Tailwind text/color class for the icon chip, e.g. "text-primary bg-primary/10" */
  tone?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable metric / KPI card. Use everywhere a "number with small label"
 * summary tile is needed so visual weight and spacing stay consistent.
 */
export function StatCard({ label, value, hint, icon, tone, className, onClick }: StatCardProps) {
  const toneClass = tone ?? "bg-primary/10 text-primary";

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:-translate-y-0.5",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
          </div>
          {icon && (
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClass)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}