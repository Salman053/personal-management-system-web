"use client"

import { ProjectTask } from "@/components/task/task-board"
import { db } from "@/lib/firebase"
import type { Doubt, EmailTemplate, FinanceRecord, Habit, LearningItem, Project, ProjectPayment, Reminder, SubTask, Task } from "@/types"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useState, useEffect } from "react"

export const useFirestoreData = (userId: string) => {
  // console.log(userId)
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectPayments, setProjectPayments] = useState<ProjectPayment[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitEntries, setHabitEntries] = useState<any[]>([])
  const [userXP, setUserXP] = useState<any[]>([])
  const [finances, setFinances] = useState<FinanceRecord[]>([])
  const [learning, setLearning] = useState<LearningItem[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [dailyTaskSubTask, setDailyTaskSubTask] = useState<SubTask[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([])
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // console.log(userId)

    const fetchData = () => {
      setLoading(true)
      setError(null)

      const uid = userId

      if (!uid) return

      const handleSnapshot = (colName: string, setState: (data: any[]) => void) => {
        const q = query(collection(db, colName), where("userId", "==", uid))
        return onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                docId: doc.id,
                ...doc.data(),
              }))
              .sort((a: any, b: any) => {
                const aTime = a.createdAt?.seconds ?? 0
                const bTime = b.createdAt?.seconds ?? 0
                return bTime - aTime // newest first
              })
            setState(data)
          },
          handleError,
        )
      }

      const unsubscribeUser = handleSnapshot("users", setUsers) // Optional: depends on access model
      const unsubscribeProjects = handleSnapshot("projects", setProjects)
      const unsubscribeProjectPayments = handleSnapshot("projectPayments", setProjectPayments)
      const unsubscribeHabits = handleSnapshot("habits", setHabits)
      const unsubscribeHabitEntries = handleSnapshot("habit_entries", setHabitEntries)
      const unsubscribeUserXP = handleSnapshot("user_xp", setUserXP)
      const unsubscribeFinances = handleSnapshot("finances", setFinances)
      const unsubscribeLearning = handleSnapshot("learning", setLearning)
      const unsubscribeReminders = handleSnapshot("reminders", setReminders)
      const unsubscribeDailyTasks = handleSnapshot("dailyTasks", setDailyTasks)
      const unsubscribeDailySubTasks = handleSnapshot("subtasks", setDailyTaskSubTask)
      const unsubscribeProjectTasks = handleSnapshot("tasks", setProjectTasks)
      const unsubscribeDoubts = handleSnapshot("doubts", setDoubts)
      const unsubscribeEmailTemplates = handleSnapshot("emailTemplates", setEmailTemplates)

      setLoading(false)

      return () => {
        unsubscribeUser?.()
        unsubscribeProjects?.()
        unsubscribeProjectPayments?.()
        unsubscribeHabits?.()
        unsubscribeHabitEntries?.()
        unsubscribeUserXP?.()
        unsubscribeFinances?.()
        unsubscribeLearning?.()
        unsubscribeReminders?.()
        unsubscribeDailyTasks?.()
        unsubscribeDailySubTasks?.()
        unsubscribeProjectTasks?.()
        unsubscribeDoubts?.()
        unsubscribeEmailTemplates?.()
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  const handleError = (error: any) => {
    console.error("Error fetching data:", error)
    setError("Failed to fetch data.")
    setLoading(false)
  }

  return {
    users,
    loading,
    error,
    dailyTaskSubTask,
    projectTasks,
    dailyTasks,
    projects,
    reminders,
    projectPayments,
    habits,
    habitEntries,
    userXP,
    doubts,
    finances,
    learning,
    emailTemplates
  }
}
