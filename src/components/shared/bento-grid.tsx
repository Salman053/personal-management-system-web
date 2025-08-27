// =====================
"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        // responsive bento
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
        className
      )}
      role="grid"
      aria-label="Dashboard Overview"
    >
      {children}
    </div>
  )
}

export function BentoItem({ className, children, title, description }: { className?: string; children: React.ReactNode; title: string; description?: string }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm",
        "transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-ring",
        className
      )}
      role="region"
      aria-label={title}
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(200px_200px_at_100%_0%,black,transparent)]" />
      <CardContent className="p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
        </div>
        {description && <p className="mb-4 text-xs text-muted-foreground sm:text-sm">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
