

"use client";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your configured Firestore instance
import { Doubt, DoubtCreate, DoubtUpdate } from "@/types";

// Helper to convert Firestore data to our typed model
function fromFirestore(id: string, data: any): Doubt {
  return {
    id,
    userId: data.userId,
    title: data.title,
    details: data.details ?? "",
    category: data.category ?? "General",
    tags: data.tags ?? [],
    priority: data.priority ?? "Low",
    status: data.status ?? "open",
    reviewBy: data.reviewBy ?? null,
    isResolved: data.isResolved ?? false,
    resolutionExplanation: data.resolutionExplanation ?? "",
    sources: data.sources ?? [],
    resolvedBy: data.resolvedBy ?? null,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    resolvedAt: data.resolvedAt?.toDate?.() ?? null,
  };
}

export const doubtService = {
  // Create new doubt
  async createDoubt(input: DoubtCreate): Promise<string> {
    const docRef = await addDoc(collection(db, "doubts"), {
      ...input,
      isResolved: Boolean(input.isResolved) || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
    });
    return docRef.id;
  },

  // Get all doubts for a user (once)
  async getDoubts(userId: string): Promise<Doubt[]> {
    const q = query(
      collection(db, "doubts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data()));
  },

  // Real-time subscription (recommended for list screens)
  watchDoubts(
    userId: string,
    cb: (doubts: Doubt[]) => void
  ): () => void {
    const q = query(
      collection(db, "doubts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => fromFirestore(d.id, d.data())));
    });
    return unsub;
  },

  // Get one by id
  async getDoubtById(id: string): Promise<Doubt | null> {
    const ref = doc(db, "doubts", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return fromFirestore(snap.id, snap.data());
  },

  // Update
  async updateDoubt(id: string, updates: DoubtUpdate): Promise<void> {
    const ref = doc(db, "doubts", id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
      // keep isResolved consistent with status if status provided
      ...(updates.status && {
        isResolved: updates.status === "resolved",
        resolvedAt: updates.status === "resolved" ? serverTimestamp() : null,
      }),
    });
  },

  // Resolve convenience helper
  async resolveDoubt(
    id: string,
    resolution: { explanation: string; sources?: string[]; resolvedBy?: string | null }
  ): Promise<void> {
    const ref = doc(db, "doubts", id);
    await updateDoc(ref, {
      status: "resolved",
      isResolved: true,
      resolutionExplanation: resolution.explanation,
      sources: resolution.sources ?? [],
      resolvedBy: resolution.resolvedBy ?? null,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Delete
  async deleteDoubt(id: string): Promise<void> {
    await deleteDoc(doc(db, "doubts", id));
  },
};

