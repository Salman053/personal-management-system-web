"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useEffect, useState } from "react"
import DateInput from "../ui/date-input"
import { toast } from "sonner"

export type TaskFormData = {
  id?: string
  title: string
  description: string
  status: "active" | "completed" | "paused" | "review"
  assignedTo: string
  dueDate: Date | any
}

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask: TaskFormData | null
  onSave: (task: TaskFormData) => void
  onCancel?: () => void
}

export default function TaskDialog({
  open,
  onOpenChange,
  editingTask,
  onSave,
  onCancel,
}: TaskDialogProps) {
  // Local form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "active",
    assignedTo: "self",
    dueDate: "",
  })

  // Sync when editing task changes
  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask)
    } else {
      setFormData({
        title: "",
        description: "",
        status: "active",
        assignedTo: "self",
        dueDate: "",
      })
    }
  }, [editingTask])

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if(formData.title==="" ){
      toast.warning("Please enter the title of the task ")
      return
    }
    if(formData.dueDate==="" ){
      toast.warning("Please enter the due date")
      return
    }

    onSave({
      ...formData,
      updatedAt: new Date(), // helpful if you store in Firestore
    } as TaskFormData)
    setFormData({
      assignedTo:"",
      description:"",
      dueDate:"",
      status:'active',
      title:""
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="p-0">
          <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {editingTask ? "Update the task details below." : "Add a new task  to the project."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 ">
          {/* Title */}
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Status + Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "completed" | "paused" | "review") =>
                  handleChange("status", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="assignedTo" className="text-sm font-medium">
                Assigned To
              </label>
              <Input
                id="assignedTo"
                placeholder="Assign to"
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </label>

            <DateInput value={formData.dueDate} id="dueDate" name="dueDate" onChange={(e)=>handleChange("dueDate",e.target.value)}/>
          
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editingTask ? "Update Task" : "Create Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
