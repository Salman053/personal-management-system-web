"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // your Firebase config
import {
  collection,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import TaskColumn from "./task-column";
import TaskDialog from "./task-dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMainContext } from "@/contexts/app-context";

export type ProjectTask = {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "paused" | "review";
  assignedTo: string;
  dueDate: Date;
  updatedAt: Date;
  projectId: string;
};

const STATUSES = ["active", "review", "paused", "completed"];

export default function TaskBoard({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const { projectTasks }: { projectTasks: Task[] } = useMainContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // 🔹 Fetch tasks from Firestore

  // 🔹 Handle Drag End
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    // Update task status in Firestore
    const taskRef = doc(db, "tasks", draggableId);
    await updateDoc(taskRef, {
      status: destination.droppableId,
      updatedAt: new Date(),
    }).then(() => {
      toast.success(`Task status updated to ${destination.droppableId}`);
    });
  };

  const handleDeleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const STATUS_THEME: Record<Task["status"], string> = {
    active:
      "border-blue-200 bg-blue-200 dark:border-blue-700 dark:bg-blue-900/20",
    review:
      "border-purple-200 bg-purple-200 dark:border-purple-700 dark:bg-purple-900/20",
    paused:
      "border-amber-200 bg-amber-200 dark:border-amber-700 dark:bg-amber-900/20",
    completed:
      "border-green-200 bg-green-200 dark:border-green-700 dark:bg-green-900/20",
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Task Management</h2>
        <Button onClick={() => setIsDialogOpen(true)}>+ Add Task</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "rounded-xl border p-3 min-h-[300px] transition",
                    STATUS_THEME[status as "active"]
                  )}
                >
                  <TaskColumn
                    status={status}
                    tasks={projectTasks.filter(
                      (t) => t.status === status && t.projectId === projectId
                    )}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setIsDialogOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Dialog for Add/Edit */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTask={editingTask}
        onSave={(taskData) => {
          if (taskData.id) {
            // update Firestore
            updateDoc(doc(db, "tasks", taskData.id), taskData);
            setEditingTask(null);
          } else {
            // create Firestore
            addDoc(collection(db, "tasks"), {
              ...taskData,
              projectId: projectId,
              userId: userId,
              createdAt: new Date(),
            });
          }
          setEditingTask(null);
        }}
        onCancel={() => setEditingTask(null)}
      />
    </div>
  );
}
