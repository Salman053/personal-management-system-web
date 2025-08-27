import { collection, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Reminder } from "@/types"


export const reminderServices = {
  async createReminder(reminderData: Omit<Reminder, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "reminders"), {
      ...reminderData,
      // Ensure dateTime is properly converted to Firestore Timestamp
      schedule: {
        ...reminderData.schedule,
        dateTime: Timestamp.fromDate(reminderData.schedule.dateTime),
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    const reminderRef = doc(db, "reminders", reminderId)
    await updateDoc(reminderRef, { ...updates, updatedAt: Timestamp.now() })
  },

  async deleteReminder(reminderId: string): Promise<void> {
    await deleteDoc(doc(db, "reminders", reminderId))
  },
}
