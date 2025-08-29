import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Habit } from "@/types"

export interface HabitCompletion {
  id: string
  habitId: string
  date: Date
  completed: boolean
  notes?: string
  createdAt: Date
}

export const habitsService = {
  // Get all habits for a user
  async getHabits(userId: string): Promise<Habit[]> {
    const q = query(collection(db, "habits"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      completedDates: doc.data().completedDates?.map((date: any) => date.toDate()) || [],
      createdAt: doc.data().createdAt.toDate(),
    })) as Habit[]
  },

  // Create a new habit
  async createHabit(
    habitData: Omit<Habit, "id" | "createdAt" | "completedDates" | "streak">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "habits"), {
      ...habitData,
      streak: 0,
      completedDates: [],
      createdAt: Timestamp.now(),
    })
    updateDoc(docRef, { id: docRef.id })
    return docRef.id

  },

  // Update a habit
  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const habitRef = doc(db, "habits", habitId)
    const updateData: any = { ...updates }


    await updateDoc(habitRef, updateData)
  },

  // Delete a habit
  async deleteHabit(habitId: string): Promise<void> {
    
    await deleteDoc(doc(db, "habits", habitId))
  },

  // Mark habit as completed for a specific date
  async markHabitCompletion(habitId: string, date: Date, completed: boolean): Promise<void> {
    // Get current habit data
    const habitRef = doc(db, "habits", habitId)

    // This is a simplified approach - in a real app, you'd want to fetch the current data first
    // For now, we'll handle this in the component level
  },

  // Get habit completions for a specific habit
  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    const q = query(collection(db, "habitCompletions"), where("habitId", "==", habitId), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as HabitCompletion[]
  },

  async calculateStreak(completedDates: string[]): Promise<{ current: number; longest: number }> {
  const completedSet = new Set(completedDates);
  let current = 0;
  let longest = 0;

  // Sort dates chronologically
  const sortedDates = [...completedSet].sort();

  // Track longest streak
  let streak = 0;
  let prevDate: Date | null = null;

  for (const d of sortedDates) {
    const date = new Date(d);
    if (
      prevDate &&
      (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24) === 1
    ) {
      streak++;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
    prevDate = date;
  }

  // Calculate current streak (backward from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  while (completedSet.has(cursor.toISOString().split("T")[0])) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

,
  
}
