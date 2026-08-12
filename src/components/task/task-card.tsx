import { Edit, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isTomorrow } from "date-fns";
import { ProjectTask } from "./task-board";

type Props = {
  task: ProjectTask;
  onEdit: (task: ProjectTask) => void;
  onDelete: (id: string) => void;
};

function prettyDate(date: Date): string {
  if (!date) return "No due date";
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM dd, yyyy");
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  return (
    <article className="group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight text-foreground">
          {task.title}
        </h3>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground transition hover:text-blue-500 hover:scale-110"
            onClick={() => onEdit(task)}
            aria-label={`Edit task "${task.title}"`}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground transition hover:text-red-500 hover:scale-110"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task "${task.title}"`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {task.description || "No description provided."}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Due {prettyDate(task.dueDate)}</span>
        </div>
      </div>

      {/* Assigned */}
      {task.assignedTo && (
        <p className="mt-2.5 text-xs font-medium text-primary">
          👤 {task.assignedTo}
        </p>
      )}
    </article>
  );
}