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
import { FinanceRecord } from "@/types"
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
  async createFinanceRecord( transactionData: Omit<FinanceRecord, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "finances"), {
      ...transactionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // // Update a transaction
  async updateTransaction(recordId: string, updates: Partial<FinanceRecord>): Promise<void> {
    const transactionRef = doc(db, "finances", recordId)
    const updateData: any = { ...updates,updatedAt:Timestamp.now() }
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
