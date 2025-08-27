"use client"

import { SubTaskDialog, type SubTaskFormValues } from "@/components/daily-task-planner/daily-sub-task-dialog"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, CheckCircle2, Clock } from "lucide-react"
import { useMainContext } from "@/contexts/app-context"
import type { SubTask } from "@/types"
import { ActionMenu } from "@/components/ui/action-menu"
import ConfirmDialog from "@/components/system/confirm-dialog"
import { TaskService } from "@/services/daily-task-planner"
import { toast } from "sonner"

export default function SingleTask() {
  const { taskId } = useParams()
  const { dailyTaskSubTask } = useMainContext() // all subtasks from context

  // Dialog state
  const [subTaskDialog, setSubTaskDialog] = useState(false)
  const [deletingSubTask, setDeletingSubTask] = useState("")
  const [deletingDialogOpen, setDeleteModalOpen] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<SubTaskFormValues | null>(null)

  const handleSave = () => {
    setEditingSubtask(null)
  }

  const handleDelete = () => {
    TaskService.deleteSubtask(deletingSubTask)
      .then(() => {
        setDeleteModalOpen(false)
        toast.success("sub task deleted")
      })
      .catch((e) => {
        toast.error(e.message)
      })
  }
  // Filter subtasks belonging to this task
  const taskSubtasks: SubTask[] = (dailyTaskSubTask || []).filter((s: SubTask) => s.taskId === taskId)

  const uniqueSubtasks = taskSubtasks.filter(
    (subtask: SubTask, index: number, self: SubTask[]) => index === self.findIndex((s: SubTask) => s.id === subtask.id),
  )

  return (
    <div className="  space-y-6">
      {/* Subtasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Subtasks</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingSubtask(null)
              setSubTaskDialog(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Subtask
          </Button>
        </div>

        {uniqueSubtasks.length > 0 ? (
          <div className="space-y-3  grid md:grid-cols-4">
            {uniqueSubtasks.map((s, index) => (
              <Card key={`subtask-${s.id}-${index}`} className="cursor-pointer py-2 hover:shadow-md transition">
                <CardHeader className="flex items-center justify-between  py-0">
                  <h3 className="font-medium">{s.title}</h3>
                  <ActionMenu
                    item={s}
                    onDelete={(id) => {
                      setDeletingSubTask(id)
                      setDeleteModalOpen(true)
                    }}
                    onEdit={(t) => {
                      console.log(t)
                      setEditingSubtask(t as any)
                      setSubTaskDialog(true)
                    }}
                  />
                </CardHeader>
                <CardContent className="py-0 flex flex-row justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{s.description || "No description"}</p>
                  <span
                    className={`flex items-center w-fit gap-1 text-xs px-2 py-1 rounded-full ${
                      s.isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {s.isCompleted ? "Completed" : "Pending"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No subtasks yet.</p>
        )}
      </div>

      {/* Subtask Dialog */}
      <SubTaskDialog
        open={subTaskDialog}
        onOpenChange={setSubTaskDialog}
        editingSubtask={editingSubtask}
        taskId={taskId as string}
        onSave={handleSave}
        onCancel={() => setEditingSubtask(null)}
      />
      <ConfirmDialog
        open={deletingDialogOpen}
        lockWhilePending
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingSubTask("")
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
