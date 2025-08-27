"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskDialog, type TaskFormValues } from "./daily-task-dialog"
import { Plus, CheckCircle, Circle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { useRouter } from "next/navigation"
import { useMainContext } from "@/contexts/app-context"
import type { Task } from "@/types"
import { ActionMenu } from "../ui/action-menu"
import ConfirmDialog from "../system/confirm-dialog"
import { TaskService } from "@/services/daily-task-planner"
import { toast } from "sonner"

// TaskCard component using shadcn Card
function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskFormValues
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const router = useRouter()
  return (
    <Card className="hover:shadow-md cursor-pointer transition rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {task.status === "completed" ? (
            <CheckCircle className="text-green-500 h-5 w-5" />
          ) : (
            <Circle className="text-muted-foreground h-5 w-5" />
          )}
          {task.title}
        </CardTitle>
        <ActionMenu
          onView={() => router.push(`/dashboard/daily-tasks/${task.id}`)}
          item={task as Task}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {task.type} • {task.for}
        </p>

        <p className="text-sm mb-2">{task.description}</p>
      </CardContent>
    </Card>
  )
}

export default function DailyTaskPlannerManager() {
  // Dialog states
  const { projects, dailyTaskSubTask, dailyTasks } = useMainContext()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskFormValues | null>(null)
  const [deletingTask, setDeletingTask] = useState("")
  const [deletingDialogOpen, setDeletingDialogOpen] = useState(false)

  const uniqueTasks = dailyTasks.filter(
    (task: Task, index: number, self: Task[]) => index === self.findIndex((t: Task) => t.id === task.id),
  )

  function openTaskEditor(t?: TaskFormValues) {
    setEditingTask(t || null)
    setTaskDialogOpen(true)
  }

  async function handleDelete() {
    await TaskService.deleteTask(deletingTask)
      .then(() => {
        toast.success("Successfully Deleted")
        setDeletingDialogOpen(false)
        setDeletingTask("")
      })
      .catch((e) => {
        toast.error("Error" + e.message)
      })
  }

  return (
    <div className="min-h-screen bg-background ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
            <p className="text-muted-foreground text-lg">Manage your daily tasks and subtasks</p>
          </div>
          <Button onClick={() => openTaskEditor()}>
            <Plus className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </div>
        <Tabs defaultValue="active" className="w-full ">
          <TabsList className="w-full p-1  ">
            <TabsTrigger className="py-1" value="active">
              Active Tasks
            </TabsTrigger>
            <TabsTrigger className="py-1" value="pending">
              Pending Tasks
            </TabsTrigger>
            <TabsTrigger className="py-1" value="completed">
              Completed Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {" "}
            <section>
              <h2 className="text-xl font-semibold mb-4">Active Tasks</h2>
              {uniqueTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueTasks
                    .filter((t: Task) => t.status === "in-progress")
                    .map((t: Task, index: number) => (
                      <TaskCard
                        key={`active-${t.id}-${index}`}
                        onDelete={(taskId) => {
                          setDeletingTask(taskId)
                          setDeletingDialogOpen(true)
                        }}
                        task={t}
                        onEdit={(task) => {
                          setEditingTask(task)
                          setTaskDialogOpen(true)
                        }}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active tasks 🎉</p>
              )}
            </section>{" "}
          </TabsContent>
          <TabsContent value="pending">
            {" "}
            {/* Completed Tasks */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
              {uniqueTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueTasks
                    .filter((t: Task) => t.status === "pending")
                    .map((t: Task, index: number) => (
                      <TaskCard
                        key={`pending-${t.id}-${index}`}
                        onDelete={(taskId) => {
                          setDeletingTask(taskId)
                          setDeletingDialogOpen(true)
                        }}
                        task={t}
                        onEdit={(task) => {
                          setEditingTask(task)
                          setTaskDialogOpen(true)
                        }}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No pending tasks yet.</p>
              )}
            </section>{" "}
          </TabsContent>
          <TabsContent value="completed">
            <section>
              <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
              {uniqueTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueTasks
                    .filter((t: Task) => t.status === "completed")
                    .map((t: Task, index: number) => (
                      <TaskCard
                        key={`completed-${t.id}-${index}`}
                        onDelete={(taskId) => {
                          setDeletingTask(taskId)
                          setDeletingDialogOpen(true)
                        }}
                        task={t}
                        onEdit={(task) => {
                          setEditingTask(task)
                          setTaskDialogOpen(true)
                        }}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No completed tasks yet.</p>
              )}
            </section>{" "}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        editingTask={editingTask}
        onSave={() => {
          setTaskDialogOpen(false)
        }}
        onCancel={() => setEditingTask(null)}
      />
      <ConfirmDialog
        open={deletingDialogOpen}
        destructive
        onCancel={() => {
          setDeletingDialogOpen(false)
          setDeletingTask("")
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
