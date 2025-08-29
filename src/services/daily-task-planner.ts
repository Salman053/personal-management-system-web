// lib/firebase/taskService.ts
import { db } from "@/lib/firebase"
import type { SubTask, Task } from "@/types"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"

export class TaskService {
  // 📌 ===== TASKS CRUD =====

  static async createTask(task: Task) {
    const ref = await addDoc(collection(db, "dailyTasks"), {
      ...task,
      status: task.status || "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  }

  static async getTask(taskId: string): Promise<Task | null> {
    const ref = doc(db, "dailyTasks", taskId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Task
  }

  static async getAllTasks(): Promise<Task[]> {
    const q = query(collection(db, "dailyTasks"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
  }

  static async updateTask(taskId: string, updates: Partial<Task>) {
    const ref = doc(db, "dailyTasks", taskId)
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
  }

  static async deleteTask(taskId: string) {
    const batch = writeBatch(db)

    // reference to the main task
    const taskRef = doc(db, "dailyTasks", taskId)
    batch.delete(taskRef)

    // get all subtasks where taskId == taskId
    const subtasksRef = collection(db, "subtasks")
    const q = query(subtasksRef, where("taskId", "==", taskId))
    const snap = await getDocs(q)

    snap.forEach((sub) => {
      batch.delete(sub.ref)
    })

    // commit both task + subtasks deletion
    await batch.commit()
  }

  // 📌 ===== SUBTASKS CRUD =====
  // Subtasks stored under "tasks/{taskId}/subtasks"

  static async createSubtask(subtask: SubTask) {
    const ref = await addDoc(collection(db, "subtasks"), {
      ...subtask,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  }

  static async getSubtasks(taskId: string): Promise<SubTask[]> {
    const q = query(collection(db, "subtasks"), where("taskId", "==", taskId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SubTask));
  }

  static async updateSubtask(subtaskId: string, updates: Partial<SubTask>) {
    
    const ref = doc(db, "subtasks", subtaskId)
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
  }

  static async deleteSubtask(subtaskId: string) {
    const ref = doc(db, "subtasks", subtaskId)
    await deleteDoc(ref)
  }

  static async toggleSubtaskCompletion(subtaskId: string, currentCompletedStatus: boolean) {
    try {
      const ref = doc(db, "subtasks", subtaskId);

      const updates: Partial<SubTask> = {
        isCompleted: !currentCompletedStatus,
        updatedAt: serverTimestamp() as any
      };

      // Set completedAt based on the new completion status
      if (!currentCompletedStatus) {
        // Marking as completed - set completedAt to now
        updates.completedAt = serverTimestamp();
      } else {
        // Marking as not completed - clear completedAt
        updates.completedAt = null;
      }

      await updateDoc(ref, updates)


      return {
        success: true,
        newStatus: !currentCompletedStatus
      };

    } catch (error) {
      console.error("Error toggling subtask completion:", error);
      throw error;
    }
  }
}
