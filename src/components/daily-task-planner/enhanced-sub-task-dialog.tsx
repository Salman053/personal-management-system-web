"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskService } from "@/services/daily-task-planner";
import { NotificationService } from "@/services/notification-service";
import type { SubTask, Task, NotificationContact } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Bell, BellOff } from "lucide-react";

export const subtaskSchema = z.object({
  title: z.string().min(1, "Subtask title required"),
  description: z.string().optional(),
  for: z.string().min(1, "Assign to required"),
  isCompleted: z.boolean().default(false),
  taskId: z.string().optional(),
  userId: z.string(),
  completedAt: z.any().optional(),
});

export type SubTaskFormValues = z.infer<typeof subtaskSchema>;

type EnhancedSubTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubtask: SubTask | null;
  taskId?: string;
  task?: Task;
  allSubtasks?: SubTask[];
  notificationContacts?: NotificationContact[];
  onSave: (subtask: SubTaskFormValues) => void;
  onCancel?: () => void;
};

export function EnhancedSubTaskDialog({
  open,
  onOpenChange,
  editingSubtask,
  taskId,
  task,
  allSubtasks = [],
  notificationContacts = [],
  onSave,
  onCancel,
}: EnhancedSubTaskDialogProps) {
  const { user } = useAuth();
  const [sendNotifications, setSendNotifications] = useState(true);

  const form = useForm<SubTaskFormValues>({
    resolver: zodResolver(subtaskSchema) as any,
    defaultValues: editingSubtask || {
      title: "",
      description: "",
      for: "self",
      isCompleted: false,
      taskId: taskId || "",
      userId: user?.uid as any,
    },
  });

  const { register, handleSubmit, reset, setValue, watch } = form;

  useEffect(() => {
    if (editingSubtask) {
      reset(editingSubtask);
    } else {
      setValue("taskId", taskId || "");
      setValue("userId", user?.uid || "");
    }
  }, [editingSubtask, reset, setValue, taskId, user]);

  const onSubmit = handleSubmit(async (data) => {
    const wasCompleted = editingSubtask?.isCompleted || false;
    const isNowCompleted = data.isCompleted;

    // Set completion date if marking as completed
    if (isNowCompleted && !wasCompleted) {
      data.completedAt = new Date();
    }

    try {
      if (editingSubtask as SubTask) {
        await TaskService.updateSubtask(
          editingSubtask?.id as string,
          data as any
        );
        reset();
        form.reset();
        toast.success("Subtask updated successfully");
        onSave(data);
        onOpenChange(false);

        // 
      } else {
        await TaskService.createSubtask(data as any);
        // 
        reset();
        form.reset();

        toast.success("Subtask created successfully");
      }

      // Send notifications if subtask was just completed
      if (
        isNowCompleted &&
        !wasCompleted &&
        sendNotifications &&
        task &&
        notificationContacts.length > 0
      ) {
        const remainingSubtasks = allSubtasks.filter(
          (st) => st.id !== editingSubtask?.id && !st.isCompleted
        );

        await NotificationService.notifyContacts(
          notificationContacts,
          data as SubTask,
          task,
          remainingSubtasks
        ).then(() => {
          reset();
          onOpenChange(false);

          toast.success("Notifications sent to family members!");
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingSubtask ? "Edit Subtask" : "Add Subtask"}
          </DialogTitle>
          <DialogDescription>
            {editingSubtask
              ? "Update subtask details"
              : "Add a new subtask to your list"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              {...register("title")}
              placeholder="e.g., Buy milk, tomatoes"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...register("description")}
              rows={2}
              placeholder="Additional details..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">For</label>
            <Input {...register("for")} placeholder="self, family, etc." />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("isCompleted")}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Mark as completed</label>
            </div>

            {watch("isCompleted") && notificationContacts.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSendNotifications(!sendNotifications)}
                >
                  {sendNotifications ? (
                    <Bell className="w-4 h-4 text-green-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {sendNotifications ? "Will notify" : "No notifications"}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onCancel?.();
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {editingSubtask ? "Update" : "Add"} Subtask
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
