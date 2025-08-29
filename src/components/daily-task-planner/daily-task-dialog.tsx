"use client";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DateInput from "../ui/date-input";
import { TaskService } from "@/services/daily-task-planner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import type { Task } from "@/types";

// -------------------------
// Zod Schemas (match your original interfaces + sharedWith)
// -------------------------

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["Personal", "Work", "Grocery"]),
  dueDate: z.any().optional(), // we'll accept string from form and convert to Date where needed
  for: z.string().min(1, "Assigned person required"),
  status: z.enum(["pending", "in-progress", "completed"]),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  completedAt: z.any().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// -------------------------
// Task Dialog (create / edit)
// -------------------------
type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: TaskFormValues | null;
  onSave: () => void;
  onCancel?: () => void;
  status?: "in-progress" | "completed" | "pending";
};

export function TaskDialog({
  open,
  status,
  onOpenChange,
  editingTask,
  onSave,
  onCancel,
}: TaskDialogProps) {
  const { user } = useAuth();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: editingTask || {
      title: "",
      description: "",
      type: "Personal",
      for: "self",
      status: status,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;

  // sharedWith field array

  // Sync form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      // convert Date -> input-friendly iso string for dueDate (if exists)
      const normalized = {
        ...editingTask,
        dueDate: editingTask.dueDate
          ? toDateTimeLocalString(editingTask.dueDate)
          : undefined,
        createdAt: editingTask.createdAt
          ? toDateTimeLocalString(editingTask.createdAt)
          : undefined,
        updatedAt: editingTask.updatedAt
          ? toDateTimeLocalString(editingTask.updatedAt)
          : undefined,
        completedAt: editingTask.completedAt
          ? toDateTimeLocalString(editingTask.completedAt)
          : undefined,
      };
      reset(normalized);
    }
  }, [editingTask, reset]);

  function toDateTimeLocalString(v: any) {
    try {
      const d = new Date(v);
      // datetime-local uses YYYY-MM-DDTHH:MM format
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  }

  const handleSave = handleSubmit(async (data) => {
    // Convert any datetime-local strings back to Date objects (if present)
    const normalized = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : "",
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
      userId: user?.uid as string,
      completedAt: data.completedAt ? new Date(data.completedAt) : "",
    };

    if (editingTask) {
      await TaskService.updateTask(
        editingTask?.id as string,
        normalized as unknown as Task
      ).then(()=>{
          toast.success("Task updated successfully");
        
      })
    } else {
      await TaskService.createTask(normalized as any)
        .then(() => {
          toast.success("Created Successfully");
        })
        .catch((e) => {
          toast.error(e.message);
        });
    }

    onSave();
    reset();
    onOpenChange(false);
  });

  const handleCancel = () => {
    onCancel?.();
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {editingTask
              ? "Update the task details below."
              : "Add a new task — subtasks can be added later."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSave}>
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Task title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-xs">
                {errors.title.message as any}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              placeholder="Description"
              {...register("description")}
            />
          </div>

          {/* Type + For */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Grocery">Grocery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">For</label>
              <Input placeholder="Assign to" {...register("for")} />
            </div>
          </div>

          {/* Status + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <DateInput
                value={watch("dueDate") as string | undefined}
                onChange={(e) => setValue("dueDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
