import { collection, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"
import { FinanceRecord } from "@/types";
import { reminderServices } from "./reminders"
import { getDaysBefore } from "@/lib/oneDayBeforeDate"
import { toast } from "sonner"
// import { Transaction } from "@/types"

export const financeServices = {
  // Get all transactions for a user
  // async getTransactions(userId: string): Promise<Transaction[]> {
  //   const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("date", "desc"))
  //   const querySnapshot = await getDocs(q)
  //   return querySnapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //     date: doc.data().date.toDate(),
  //     createdAt: doc.data().createdAt.toDate(),
  //   })) as Transaction[]
  // },

  // Create a new transaction
  async createFinanceRecord(
    transactionData: Omit<FinanceRecord, "id" | "createdAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "finances"), {
      ...transactionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });


    console.log(transactionData.date, transactionData.dueDate)
    // Only create reminder for Borrowed/Lent, not for normal Income/Expense
    if (transactionData.type !== "Income" && transactionData.type !== "Expense") {
      if (transactionData.dueDate) {
        await reminderServices.createReminder({
          channel: ["push"],
          priority: "Medium",
          schedule: {
            dateTime: getDaysBefore(transactionData?.dueDate as any, 1), // one day before dueDate
            repeat: "none", // could be dynamic based on user choice
          },
          status: "scheduled",
          title: transactionData.type === "Borrowed" ? financeMessageTemplates.Borrowed(transactionData.amount, transactionData.description) : financeMessageTemplates.Lent(transactionData.amount, transactionData.description),
          type: "Finance",
          userId: transactionData.userId,
          description: transactionData.description,
          documentId: docRef.id,
        }).then(()=>{
          toast.success("The reminder is created successfully for this Record")
        })
      } else {
        toast.error("Opps no Due Date is provided the reminder is not created")
        console.warn("No dueDate provided, skipping reminder creation");
      }
    }

    return docRef.id;
  }
  ,

  // // Update a transaction
  async updateFinanceRecord(recordId: string, updates: Partial<FinanceRecord>): Promise<void> {
    const transactionRef = doc(db, "finances", recordId)
    const updateData: any = { ...updates, updatedAt: Timestamp.now() }
    await updateDoc(transactionRef, updateData)
  },

  // Delete a transaction
  async deleteRecord(recordId: string): Promise<void> {
    await deleteDoc(doc(db, "finances", recordId))
  },

  // Get transactions by type
  // async getTransactionsByType(userId: string, type: string): Promise<Transaction[]> {
  //   const q = query(
  //     collection(db, "transactions"),
  //     where("userId", "==", userId),
  //     where("type", "==", type),
  //     orderBy("date", "desc"),
  //   )
  //   const querySnapshot = await getDocs(q)
  //   return querySnapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //     date: doc.data().date.toDate(),
  //     createdAt: doc.data().createdAt.toDate(),
  //   })) as Transaction[]
  // },

  // Get transactions by category
  // async getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]> {
  //   const q = query(
  //     collection(db, "transactions"),
  //     where("userId", "==", userId),
  //     where("category", "==", category),
  //     orderBy("date", "desc"),
  //   )
  //   const querySnapshot = await getDocs(q)
  //   return querySnapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //     date: doc.data().date.toDate(),
  //     createdAt: doc.data().createdAt.toDate(),
  //   })) as Transaction[]
  // },
}



// financeMessageTemplates.ts
export const financeMessageTemplates = {
  Borrowed: (amount: number, description?: string) =>
    `Reminder: You need to RETURN ${amount} that you borrowed. ${description ?? ""}`,

  Lent: (amount: number, description?: string) =>
    `Reminder: Someone needs to RETURN ${amount} you lent. ${description ?? ""}`,

  Expense: (amount: number, description?: string) =>
    `You have an EXPENSE of ${amount}. ${description ?? ""}`,

  Income: (amount: number, description?: string) =>
    `You have an INCOME of ${amount}. ${description ?? ""}`,
} as const;
