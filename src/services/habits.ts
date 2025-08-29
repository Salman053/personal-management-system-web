import type { Habit, HabitEntry, HabitStats, UserProfile, HabitAnalytics, Goal, UserXP, XPSummary } from "@/types/index"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export class HabitService {
  private getCurrentUserId(): string {
    const user = auth.currentUser
    if (!user) throw new Error("User not authenticated")
    return user.uid
  }

  private timestampToDate(timestamp: any): Date {
    if (timestamp?.toDate) {
      return timestamp.toDate()
    }
    return new Date(timestamp)
  }

  // Habit CRUD operations
  async getHabits(): Promise<Habit[]> {
    try {
      const userId = this.getCurrentUserId()
      const habitsRef = collection(db, "habits")
      const q = query(habitsRef, where("userId", "==", userId), where("isActive", "==", true))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt),
        updatedAt: this.timestampToDate(doc.data().updatedAt),
      })) as Habit[]
    } catch (error) {
      console.error("Error fetching habits:", error)
      throw new Error("Failed to fetch habits")
    }
  }

  async getHabit(id: string): Promise<Habit | null> {
    try {
      const habitRef = doc(db, "habits", id)
      const habitSnap = await getDoc(habitRef)

      if (!habitSnap.exists()) return null

      const data = habitSnap.data()
      return {
        id: habitSnap.id,
        ...data,
        createdAt: this.timestampToDate(data.createdAt),
        updatedAt: this.timestampToDate(data.updatedAt),
      } as Habit
    } catch (error) {
      console.error("Error fetching habit:", error)
      return null
    }
  }

  async createHabit(habit: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit> {
    try {
      const userId = this.getCurrentUserId()
      const habitsRef = collection(db, "habits")

      const habitData = {
        ...habit,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(habitsRef, habitData)

      return {
        id: docRef.id,
        ...habit,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error("Error creating habit:", error)
      throw new Error("Failed to create habit")
    }
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    try {
      const habitRef = doc(db, "habits", id)
      await updateDoc(habitRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const updatedHabit = await this.getHabit(id)
      if (!updatedHabit) throw new Error("Habit not found after update")

      return updatedHabit
    } catch (error) {
      console.error("Error updating habit:", error)
      throw new Error("Failed to update habit")
    }
  }

  async deleteHabit(id: string): Promise<void> {
    try {
      const habitRef = doc(db, "habits", id)
      await updateDoc(habitRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error deleting habit:", error)
      throw new Error("Failed to delete habit")
    }
  }

  // Habit entries and tracking
  async getHabitEntries(habitId: string, startDate?: string, endDate?: string): Promise<HabitEntry[]> {
    try {
      const entriesRef = collection(db, "habit_entries")
      let q = query(entriesRef, where("habitId", "==", habitId), orderBy("date", "desc"))

      if (startDate && endDate) {
        q = query(
          entriesRef,
          where("habitId", "==", habitId),
          where("date", ">=", startDate),
          where("date", "<=", endDate),
          orderBy("date", "desc"),
        )
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt),
        updatedAt: this.timestampToDate(doc.data().updatedAt),
      })) as HabitEntry[]
    } catch (error) {
      console.error("Error fetching habit entries:", error)
      return []
    }
  }

  async markHabitComplete(habitId: string, date: string, value?: number, notes?: string): Promise<HabitEntry> {
    try {
      const userId = this.getCurrentUserId()
      const entriesRef = collection(db, "habit_entries")

      // Check if entry already exists
      const existingQuery = query(entriesRef, where("habitId", "==", habitId), where("date", "==", date))
      const existingSnapshot = await getDocs(existingQuery)

      const entryData = {
        habitId,
        userId,
        date,
        completed: true,
        value,
        notes,
        updatedAt: serverTimestamp(),
      }

      if (!existingSnapshot.empty) {
        // Update existing entry
        const existingDoc = existingSnapshot.docs[0]
        await updateDoc(doc(db, "habit_entries", existingDoc.id), entryData)

        return {
          id: existingDoc.id,
          ...entryData,
          createdAt: this.timestampToDate(existingDoc.data().createdAt),
          updatedAt: new Date(),
        } as HabitEntry
      } else {
        // Create new entry
        const newEntryData = {
          ...entryData,
          createdAt: serverTimestamp(),
        }

        const docRef = await addDoc(entriesRef, newEntryData)

        await this.addXP(10, `Completed habit`, "habit_completion", habitId)

        return {
          id: docRef.id,
          ...entryData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as HabitEntry
      }
    } catch (error) {
      console.error("Error marking habit complete:", error)
      throw new Error("Failed to mark habit complete")
    }
  }

  async getHabitStats(habitId: string): Promise<HabitStats> {
    try {
      const entries = await this.getHabitEntries(habitId)
      const completedEntries = entries.filter((e) => e.completed)

      const totalCompletions = completedEntries.length
      const completionRate = entries.length > 0 ? totalCompletions / entries.length : 0

      // Calculate streak
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      for (const entry of sortedEntries) {
        if (entry.completed) {
          tempStreak++
          if (currentStreak === 0) currentStreak = tempStreak
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 0
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      const averageValue =
        completedEntries.length > 0
          ? completedEntries.reduce((sum, e) => sum + (e.value || 0), 0) / completedEntries.length
          : 0

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const weeklyCompletions = completedEntries.filter((e) => new Date(e.date) >= weekAgo).length
      const monthlyCompletions = completedEntries.filter((e) => new Date(e.date) >= monthAgo).length

      return {
        habitId,
        totalCompletions,
        completionRate,
        averageValue,
        weeklyCompletions,
        monthlyCompletions,
        streakData: {
          habitId,
          currentStreak,
          longestStreak,
          lastCompletedDate: completedEntries[0]?.date || "",
          streakStartDate: sortedEntries[currentStreak - 1]?.date || "",
        },
        trendDirection: completionRate > 0.8 ? "up" : completionRate > 0.6 ? "stable" : "down",
        lastSevenDays: sortedEntries.slice(0, 7).map((e) => e.completed),
      }
    } catch (error) {
      console.error("Error calculating habit stats:", error)
      throw new Error("Failed to calculate habit stats")
    }
  }

  // User profile and gamification
  async getUserProfile(): Promise<UserProfile> {
    try {
      const userId = this.getCurrentUserId()
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create default profile for new user
        const defaultProfile: Omit<UserProfile, "id"> = {
          name: auth.currentUser?.displayName || "User",
          email: auth.currentUser?.email || "",
          level: 1,
          badges: [],
          achievements: [],
          preferences: {
            theme: "system",
            notifications: true,
            reminderTime: "09:00",
            weekStartsOn: 1,
            timezone: "UTC",
            language: "en",
            motivationalQuotes: true,
            soundEffects: true,
          },
          joinedAt: new Date(),
          streakCount: 0,
          totalHabitsCompleted: 0,
        }

        await updateDoc(userRef, {
          ...defaultProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        return { id: userId, ...defaultProfile }
      }

      const data = userSnap.data()
      return {
        id: userId,
        ...data,
        joinedAt: this.timestampToDate(data.joinedAt),
      } as UserProfile
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw new Error("Failed to fetch user profile")
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const userId = this.getCurrentUserId()
      const userRef = doc(db, "users", userId)

      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      return await this.getUserProfile()
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update user profile")
    }
  }

  async addXP(
    amount: number,
    reason: string,
    type: UserXP["type"] = "habit_completion",
    habitId?: string,
  ): Promise<{ newXP: number; levelUp: boolean; newLevel?: number }> {
    try {
      const userId = this.getCurrentUserId()
      const xpRef = collection(db, "user_xp")

      // Add XP record
      await addDoc(xpRef, {
        userId,
        habitId,
        amount,
        reason,
        type,
        createdAt: serverTimestamp(),
      })

      // Get updated XP summary
      const xpSummary = await this.getXPSummary()

      // Check for level up
      const levelUp = xpSummary.currentXP >= xpSummary.xpToNextLevel
      let newLevel = xpSummary.level

      if (levelUp) {
        newLevel = xpSummary.level + 1
        // Add level up bonus XP
        await addDoc(xpRef, {
          userId,
          amount: 50,
          reason: `Level up to ${newLevel}!`,
          type: "level_up",
          createdAt: serverTimestamp(),
        })

        // Update user level
        await this.updateUserProfile({ level: newLevel })
      }

      return {
        newXP: xpSummary.totalXP,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
      }
    } catch (error) {
      console.error("Error adding XP:", error)
      throw new Error("Failed to add XP")
    }
  }

  async getXPSummary(): Promise<XPSummary> {
    try {
      const userId = this.getCurrentUserId()
      const xpRef = collection(db, "user_xp")
      const q = query(xpRef, where("userId", "==", userId))
      const snapshot = await getDocs(q)

      let totalXP = 0
      const habitXP: { [habitId: string]: number } = {}

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        totalXP += data.amount

        if (data.habitId) {
          habitXP[data.habitId] = (habitXP[data.habitId] || 0) + data.amount
        }
      })

      // Calculate level and XP to next level
      const level = Math.floor(totalXP / 100) + 1
      const currentXP = totalXP % 100
      const xpToNextLevel = 100 - currentXP

      return {
        totalXP,
        currentXP,
        level,
        xpToNextLevel,
        habitXP,
      }
    } catch (error) {
      console.error("Error getting XP summary:", error)
      throw new Error("Failed to get XP summary")
    }
  }

  async getXPHistory(limit = 50): Promise<UserXP[]> {
    try {
      const userId = this.getCurrentUserId()
      const xpRef = collection(db, "user_xp")
      const q = query(xpRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt),
      })) as UserXP[]
    } catch (error) {
      console.error("Error getting XP history:", error)
      return []
    }
  }

  async getHabitXP(habitId: string): Promise<number> {
    try {
      const userId = this.getCurrentUserId()
      const xpRef = collection(db, "user_xp")
      const q = query(xpRef, where("userId", "==", userId), where("habitId", "==", habitId))
      const snapshot = await getDocs(q)

      return snapshot.docs.reduce((total, doc) => total + doc.data().amount, 0)
    } catch (error) {
      console.error("Error getting habit XP:", error)
      return 0
    }
  }

  // Analytics and insights
  async getHabitAnalytics(): Promise<HabitAnalytics> {
    try {
      const habits = await this.getHabits()
      const userId = this.getCurrentUserId()

      // Get all entries for today
      const today = new Date().toISOString().split("T")[0]
      const entriesRef = collection(db, "habit_entries")
      const todayQuery = query(
        entriesRef,
        where("userId", "==", userId),
        where("date", "==", today),
        where("completed", "==", true),
      )
      const todaySnapshot = await getDocs(todayQuery)

      // Calculate completion rates for each habit
      const habitStats = await Promise.all(
        habits.map(async (habit) => {
          const stats = await this.getHabitStats(habit.id)
          return { habit, stats }
        }),
      )

      const topPerforming = habitStats
        .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
        .slice(0, 3)
        .map((h) => h.habit)

      const struggling = habitStats
        .sort((a, b) => a.stats.completionRate - b.stats.completionRate)
        .slice(0, 2)
        .map((h) => h.habit)

      const streakLeaderboard = habitStats
        .map((h) => ({ habit: h.habit, streak: h.stats.streakData.currentStreak }))
        .sort((a, b) => b.streak - a.streak)

      return {
        totalHabits: habits.length,
        activeHabits: habits.filter((h) => h.isActive).length,
        completedToday: todaySnapshot.size,
        weeklyProgress: habitStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / habits.length,
        monthlyProgress: habitStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / habits.length,
        averageCompletionRate: habitStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / habits.length,
        topPerformingHabits: topPerforming,
        strugglingHabits: struggling,
        streakLeaderboard,
        categoryBreakdown: this.calculateCategoryBreakdown(habitStats),
        timeAnalysis: [], // Would need more complex time tracking
        moodCorrelation: [], // Would need mood data from entries
      }
    } catch (error) {
      console.error("Error calculating analytics:", error)
      throw new Error("Failed to calculate analytics")
    }
  }

  private calculateCategoryBreakdown(habitStats: any[]): any[] {
    const categories = new Map()

    habitStats.forEach(({ habit, stats }) => {
      if (!categories.has(habit.category)) {
        categories.set(habit.category, { count: 0, totalRate: 0 })
      }
      const cat = categories.get(habit.category)
      cat.count++
      cat.totalRate += stats.completionRate
    })

    return Array.from(categories.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      completionRate: data.totalRate / data.count,
    }))
  }

  // Goals and milestones
  async getGoals(): Promise<Goal[]> {
    try {
      const userId = this.getCurrentUserId()
      const goalsRef = collection(db, "goals")
      const q = query(goalsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        targetDate: this.timestampToDate(doc.data().targetDate),
        createdAt: this.timestampToDate(doc.data().createdAt),
        updatedAt: this.timestampToDate(doc.data().updatedAt),
      })) as Goal[]
    } catch (error) {
      console.error("Error fetching goals:", error)
      return []
    }
  }

  // Motivational content
  async getMotivationalQuote(): Promise<{ text: string; author: string }> {
    const quotes = [
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
      {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
      },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Don't put off tomorrow what you can do today.", author: "Benjamin Franklin" },
    ]

    return quotes[Math.floor(Math.random() * quotes.length)]
  }
}

export const habitService = new HabitService()
