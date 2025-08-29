"use client"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import DateInput from "../ui/date-input"
import { TaskService } from "@/services/daily-task-planner"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Subtask title required"),
  description: z.string().optional(),
  for: z.string().min(1, "Assign to required"),
  isCompleted: z.boolean().default(false),
  taskId: z.string().optional(),
  userId: z.string(),
  completedAt: z.any().optional().default(new Date().toISOString().split("T")[0]),
})

export type SubTaskFormValues = z.infer<typeof subtaskSchema>

type SubTaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSubtask: SubTaskFormValues | null
  taskId?: string
  onSave: (subtask: SubTaskFormValues) => void
  onCancel?: () => void
}

export function SubTaskDialog({ open, onOpenChange, editingSubtask, taskId, onSave, onCancel }: SubTaskDialogProps) {
  const { user } = useAuth()
  const form = useForm<SubTaskFormValues>({
    resolver: zodResolver(subtaskSchema) as any,
    defaultValues: editingSubtask || {
      title: "",
      description: "",
      for: "self",
      isCompleted: false,
      completedAt: new Date().toISOString().split("T")[0],
      taskId: taskId || "",
      userId: user?.uid as any,
    },
  })

  const { register, handleSubmit, control, reset, setValue, watch } = form

  useEffect(() => {
    if (editingSubtask) {
      const normalized = {
        ...editingSubtask,
        completedAt: editingSubtask.completedAt ? toDateTimeLocalString(editingSubtask.completedAt) : "",
      }
      reset(normalized)
    } else {
      // ensure taskId present for new subtask
      setValue("taskId", taskId || "")
    }
  }, [editingSubtask, reset, setValue, taskId])

  function toDateTimeLocalString(v: any) {
    try {
      const d = new Date(v)
      return d.toISOString().slice(0, 16)
    } catch {
      return ""
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    const normalized = {
      ...data,
      completedAt: data.completedAt ? new Date(data.completedAt) : "",
    }

    if (editingSubtask) {
      
      await TaskService.updateSubtask(editingSubtask.id as string, normalized as any)
        .then(() => {
          toast.success("SubTask updated successfully")
        })
        .catch((e) => {
          toast.error(e.message)
          
        })
    } else {
      await TaskService.createSubtask(normalized as any)
        .then(() => {
          toast.success("SubTask created successfully")
        })
        .catch((e) => {
          toast.error(e.message)
        })
    }
    onSave(normalized)
    reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingSubtask ? "Edit Subtask" : "Add Subtask"}</DialogTitle>
          <DialogDescription>
            Subtasks belong to a parent task and can have their own shared contacts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm">Title</label>
            <Input {...register("title")} placeholder="Subtask title" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm">Description</label>
            <Textarea {...register("description")} rows={3} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm">For</label>
            <Input {...register("for")} placeholder="Assign to" />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm">Completed</label>
            <input type="checkbox" {...register("isCompleted")} defaultChecked={watch("isCompleted")} />
            {watch("isCompleted") && (
              <DateInput
                value={(watch("completedAt") as string) || new Date().toISOString().split("T")[0]}
                onChange={(e) => setValue("completedAt", e.target.value)}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onCancel?.()
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {editingSubtask ? "Update Subtask" : "Add Subtask"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
