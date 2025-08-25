// src/services/learning.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LearningItem } from "@/types";

// -----------------------------
// Error Types
// -----------------------------
export class LearningServiceError extends Error {
  constructor(
    message: string,
    public code:
      | "PERMISSION_DENIED"
      | "NOT_FOUND"
      | "INVALID_DATA"
      | "NETWORK_ERROR"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "LearningServiceError";
  }
}

// -----------------------------
// Firestore Mapping
// -----------------------------
// const docToLearningItem = (
//   doc: QueryDocumentSnapshot | DocumentSnapshot
// ): LearningItem | null => {
//   if (!doc.exists()) return null;
//   const data = doc.data();

//   return {
//     id: doc.id,
//     title: data.title || "",
//     type: data.type || "note",
//     parentId: data.parentId,
//     description: data.description || "",
//     resources: data.resources || [],
//     tags: data.tags || [],

//     progress: data.progress || 0,
//     completed: data.completed || false,
//     estimatedTime: data.estimatedTime,
//     actualTime: data.actualTime,
//     priority: data.priority || "medium",
//     dueDate: data.dueDate?.toDate(),
//     hasAssessment: data.hasAssessment || false,
//     score: data.score,
//     createdBy: data.createdBy,
//     createdAt: data.createdAt?.toDate() || new Date(),
//     updatedAt: data.updatedAt?.toDate() || new Date(),
//   } as LearningItem;
// };

// -----------------------------
// Service Implementation
// -----------------------------
export const learningService = {
  //   /**
  //    * Get multiple learning items for a user
  //    */
  //   async getLearningItems(
  //     userId: string,
  //     options: {
  //       parentId?: string;
  //       type?: LearningItem["type"];
  //       completed?: boolean;
  //       pageSize?: number;
  //       startAfterDoc?: DocumentSnapshot;
  //     } = {}
  //   ): Promise<{ items: LearningItem[]; hasMore: boolean }> {
  //     try {
  //       let q = query(collection(db, "learning"), where("createdBy", "==", userId));

  //       if (options.parentId) {
  //         q = query(q, where("parentId", "==", options.parentId));
  //       }

  //       if (options.type) {
  //         q = query(q, where("type", "==", options.type));
  //       }

  //       if (options.completed !== undefined) {
  //         q = query(q, where("completed", "==", options.completed));
  //       }

  //       q = query(q, orderBy("createdAt", "desc"));

  //       if (options.pageSize) q = query(q, limit(options.pageSize));
  //       if (options.startAfterDoc) q = query(q, startAfter(options.startAfterDoc));

  //       const snap = await getDocs(q);
  //       const items = snap.docs.map(docToLearningItem).filter(Boolean) as LearningItem[];

  //       return { items, hasMore: options.pageSize ? snap.docs.length === options.pageSize : false };
  //     } catch (error: any) {
  //       throw new LearningServiceError(
  //         "Failed to load learning items",
  //         error.code === "permission-denied" ? "PERMISSION_DENIED" : "NETWORK_ERROR"
  //       );
  //     }
  //   },

  /**
   * Get a single learning item
   */
  // async getLearningItem(userId: string, id: string): Promise<LearningItem | null> {
  //   try {
  //     const ref = doc(db, "learning", id);
  //     const snap = await getDoc(ref);
  //     if (!snap.exists()) return null;

  //     const item = docToLearningItem(snap);
  //     if (item && item.createdBy !== userId) {
  //       throw new LearningServiceError("Access denied", "PERMISSION_DENIED");
  //     }

  //     return item;
  //   } catch (error: any) {
  //     if (error instanceof LearningServiceError) throw error;
  //     throw new LearningServiceError(
  //       "Failed to get learning item",
  //       error.code === "permission-denied" ? "PERMISSION_DENIED" : "NETWORK_ERROR"
  //     );
  //   }
  // },

  /**
   * Create new learning item
   */
  async createLearningItem(
    userId: string,
    data: Omit<LearningItem, "id" | "createdBy" | "createdAt" | "updatedAt">
  ): Promise<any> {
    try {



      const clean = {
        ...data,
        title: data.title.trim(),
        description: data.description?.trim() || "",
        resources: data.resources?.filter((r) => r.label && r.url) || [],
        tags: data.tags?.filter((t) => t.trim()) || [],
        progress: Math.max(0, Math.min(100, data.progress || 0)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const ref = await addDoc(collection(db, "learning"), clean);

      // Optional: update parent progress if nested
      if (data.parentId) {
        await this.updateParentProgress(userId, data.parentId);
      }

      return ref.id;
    } catch (error: any) {
      console.log(error)
      // if (error instanceof LearningServiceError) throw error;
      // throw new LearningServiceError(
      //   "Failed to create learning item",
      //   error.code === "permission-denied" ? "PERMISSION_DENIED" : "NETWORK_ERROR"
      // );
    }
  },

  /**
   * Update learning item
   */
  async updateLearningItem(
    id: string,
    updates: Partial<Omit<LearningItem, "id" | "createdBy" | "createdAt">>
  ): Promise<void> {
    try {
      const ref = doc(db, "learning", id);
      const clean: any = { updatedAt: Timestamp.now() };
      console.log(clean)

      if (updates.title !== undefined) {
        if (!updates.title.trim()) {
          throw new LearningServiceError("Title cannot be empty", "INVALID_DATA");
        }
        clean.title = updates.title.trim();
      }

      if (updates.description !== undefined) clean.description = updates.description.trim();
      if (updates.progress !== undefined)
        clean.progress = Math.max(0, Math.min(100, updates.progress));
      if (updates.estimatedTime !== undefined) clean.estimatedTime = Math.max(0, updates.estimatedTime);
      if (updates.actualTime !== undefined) clean.actualTime = Math.max(0, updates.actualTime);
      if (updates.score !== undefined) clean.score = Math.max(0, Math.min(100, updates.score));
      if (updates.resources !== undefined)
        clean.resources = updates.resources.filter((r) => r.label && r.url);
      if (updates.tags !== undefined)
        clean.tags = updates.tags.filter((t) => t.trim());

      ["completed", "priority", "hasAssessment", "dueDate", "type"].forEach((f) => {
        if (updates[f as keyof typeof updates] !== undefined) {
          clean[f] = updates[f as keyof typeof updates];
        }
      });
      await updateDoc(ref, clean);

      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().parentId) {
        await this.updateParentProgress(snap.data().userId, snap.data().parentId);
      }
    } catch (error: any) {
      console.log(error)
    }
  },


  async getUserLearningTree(userId: string) {
    const q = query(collection(db, "learning"), where("userId", "==", userId));
    const snap = await getDocs(q);

    const items: LearningItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as LearningItem[];

    // Group items by parentId
    const byParent: Record<string, LearningItem[]> = {};
    items.forEach((item) => {
      const pid = item.parentId || "root"; // "" or undefined → root
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(item);
    });

    // Recursive builder
    function buildTree(parentId: string = "root"): any[] {
      return (byParent[parentId] || []).map((item) => ({
        ...item,
        children: buildTree(item.id), // subtopics & notes
      }));
    }

    return buildTree(); // top-level (roadmaps + independent topics)
  }
  ,


  /**
   * Delete learning item + its children (cascade)
   */
  async deleteLearningItem(userId: string, id: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      const deleteRecursively = async (itemId: string) => {
        const ref = doc(db, "learning", itemId);
        batch.delete(ref);

        const childSnap = await getDocs(query(collection(db, "learning"), where("userId", "==", userId), where("parentId", "==", itemId)));
        for (const child of childSnap.docs) {
          await deleteRecursively(child.id);
        }
      };

      await deleteRecursively(id);
      await batch.commit();
    } catch (error: any) {
      console.log(error)
    }
  },

  /**
   * Update parent's progress based on children
   */
  async updateParentProgress(userId: string, parentId: string): Promise<void> {
    const parentRef = doc(db, "learning", parentId);
    const parentSnap = await getDoc(parentRef);

    if (!parentSnap.exists()) return;

    const parent = parentSnap.data() as LearningItem;

    // Fetch children (topics for roadmap, subtopics for topic)
    const q = query(
      collection(db, "learning"),
      where("parentId", "==", parentId),
      where("userId", "==", userId)
    );
    const childrenSnap = await getDocs(q);

    if (childrenSnap.empty) return;

    const children = childrenSnap.docs.map((d) => d.data() as LearningItem);

    // 1️⃣ Roadmap progress = average of its topics’ progress
    if (parent.type === "roadmap") {
      const avgProgress =
        children.reduce((sum, c) => sum + (c.progress || 0), 0) / children.length;

      await updateDoc(parentRef, {
        progress: Math.round(avgProgress),
        updatedAt: Timestamp.now(),
      });
    }

    // 2️⃣ Topic progress = percentage of completed subtopics
    if (parent.type === "topic") {
      const completedCount = children.filter((c) => c.completed).length;
      const progress = Math.round((completedCount / children.length) * 100);

      await updateDoc(parentRef, {
        progress,
        completed: progress === 100,
        updatedAt: Timestamp.now(),
      });
    }

    // 3️⃣ Recursively bubble progress up to roadmap
    if (parent.parentId) {
      await this.updateParentProgress(userId, parent.parentId);
    }
  }

  //  updateParentProgress(userId: string, parentId: string): Promise<void> {
  //   try {
  //     const childrenSnap = await getDocs(
  //       query(collection(db, "learning"), where("parentId", "==", parentId), where("userId", "==", userId))
  //     );
  //     if (childrenSnap.empty) return;

  //     const progresses = childrenSnap.docs.map((d) => d.data().progress || 0);
  //     const avg = Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length);

  //     await updateDoc(doc(db, "learning", parentId), {
  //       progress: avg,
  //       updatedAt: Timestamp.now(),
  //     });
  //   } catch (error) {
  //     console.error("Failed to update parent progress:", error);
  //   }
  // },
};


/**
 * Recalculate progress for a parent item (roadmap or topic)
 */
//   updateParentProgress (userId: string, parentId: string): Promise<void> {
//   const parentRef = doc(db, "learning", parentId);
//   const parentSnap = await getDoc(parentRef);

//   if (!parentSnap.exists()) return;

//   const parent = parentSnap.data() as LearningItem;

//   // Fetch children (topics for roadmap, subtopics for topic)
//   const q = query(
//     collection(db, "learning"),
//     where("parentId", "==", parentId),
//     where("createdBy", "==", userId)
//   );
//   const childrenSnap = await getDocs(q);

//   if (childrenSnap.empty) return;

//   const children = childrenSnap.docs.map((d) => d.data() as LearningItem);

//   // 1️⃣ Roadmap progress = average of its topics’ progress
//   if (parent.type === "roadmap") {
//     const avgProgress =
//       children.reduce((sum, c) => sum + (c.progress || 0), 0) / children.length;

//     await updateDoc(parentRef, {
//       progress: Math.round(avgProgress),
//       updatedAt: Timestamp.now(),
//     });
//   }

//   // 2️⃣ Topic progress = percentage of completed subtopics
//   if (parent.type === "topic") {
//     const completedCount = children.filter((c) => c.completed).length;
//     const progress = Math.round((completedCount / children.length) * 100);

//     await updateDoc(parentRef, {
//       progress,
//       completed: progress === 100,
//       updatedAt: Timestamp.now(),
//     });
//   }

//   // 3️⃣ Recursively bubble progress up to roadmap
//   if (parent.parentId) {
//     await this.updateParentProgress(userId, parent.parentId);
//   }
// }
