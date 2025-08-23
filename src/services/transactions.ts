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
// import { Transaction } from "@/types"

export const transactionsService = {
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

  // // Create a new transaction
  // async createTransaction(userId: string, transactionData: Omit<Transaction, "id" | "createdAt">): Promise<string> {
  //   const docRef = await addDoc(collection(db, "transactions"), {
  //     ...transactionData,
  //     userId,
  //     createdAt: Timestamp.now(),
  //     updatedAt: Timestamp.now(),
  //   })
  //   return docRef.id
  // },

  // // Update a transaction
  // async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
  //   const transactionRef = doc(db, "projectPayments", transactionId)
  //   const updateData: any = { ...updates,updatedAt:Timestamp.now() }

  //   await updateDoc(transactionRef, updateData)
  // },

  // // Delete a transaction
  // async deleteTransaction(transactionId: string): Promise<void> {
  //   await deleteDoc(doc(db, "projectPayments", transactionId))
  // },

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
