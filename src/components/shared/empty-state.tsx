import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent "nothing here yet" empty state with optional CTA.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <CardContent className="flex flex-col items-center gap-4">
        {icon && <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">{icon}</div>}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="mt-1">{action}</div>}
      </CardContent>
    </Card>
  );
}