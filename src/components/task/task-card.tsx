import { Edit, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/types";

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

const statusMeta: Record<
  Task["status"],
  { label: string; classes: string; iconColor: string }
> = {
  pending: {
    label: "Pending",
    classes:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    iconColor: "text-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    classes:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    iconColor: "text-amber-500",
  },
  completed: {
    label: "Completed",
    classes:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    iconColor: "text-green-500",
  },
};

function prettyDate(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM dd, yyyy");
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { label, classes, iconColor } = statusMeta[task.status];

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow",
        "hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {task.title}
        </h3>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 text-gray-400 transition hover:text-blue-500 hover:scale-110",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            )}
            onClick={() => onEdit(task)}
            aria-label={`Edit task “${task.title}”`}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 text-gray-400 transition hover:text-red-500 hover:scale-110",
              "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            )}
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task “${task.title}”`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
        {task.description || "No description provided."}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Due {prettyDate(task.dueDate)}</span>
        </div>

        {/* <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            classes
          )}
        >
          {label}
        </span> */}
      </div>

      {/* Assigned */}
      {task.for && (
        <p className="mt-2.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          👤 {task.for}
        </p>
      )}
    </article>
  );
}