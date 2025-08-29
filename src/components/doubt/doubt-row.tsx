"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Doubt } from "@/types/index";
import { ActionMenu } from "../ui/action-menu";
import { Clock, CheckCircle2, AlertCircle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utility";

export default function DoubtRow({
  doubt,
  onEdit,
  onDelete,
  onResolve,
  onView,
}: {
  doubt: Doubt;
  onEdit: (d: Doubt) => void;
  onDelete: (id: string) => void;
  onResolve: (doubt: Doubt) => void;
  onView: (doubt: Doubt) => void;
}) {
  const statusColors: Record<Doubt["status"], string> = {
    open: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_review: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
  };

  const priorityColors: Record<Doubt["priority"], string> = {
    Low: "bg-gray-100 text-gray-800 border-gray-200",
    Medium: "bg-indigo-100 text-indigo-800 border-indigo-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Critical: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="group relative flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:bg-muted/40">
      {/* Title + Status Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center flex-wrap justify-center gap-2 min-w-0">
          <h3
            className="font-semibold text-lg truncate cursor-pointer hover:underline"
            onClick={() => onView(doubt)}
          >
            {doubt.title}
          </h3>
          <div className="flex items-center flex-wrap  ml-12 gap-2 justify-center">
            <Badge
              variant="outline"
              className={cn("capitalize border", statusColors[doubt.status])}
            >
              {doubt.status.replace("_", " ")}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "capitalize border",
                priorityColors[doubt.priority]
              )}
            >
              {doubt.priority}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {doubt.category}
            </Badge>
          </div>
        </div>
        <ActionMenu
          item={doubt}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Details */}
      {doubt.details && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {doubt.details.slice(0,30)} ...
        </p>
      )}

      {/* Tags + Meta */}
      <div className="flex flex-wrap items-center gap-2">
        {doubt.tags?.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="flex items-center gap-1 text-xs"
          >
            <Tag className="h-3 w-3" /> {t}
          </Badge>
        ))}

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(doubt.createdAt)}
        </div>
      </div>

      {/* Resolve Button */}
      {!doubt.isResolved && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="default"
            onClick={() => onResolve(doubt)}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark Resolved
          </Button>
        </div>
      )}
    </div>
  );
}
