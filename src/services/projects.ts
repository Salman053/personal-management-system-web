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
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Project, ProjectPayment } from "@/types"


export interface ProjectMilestone {
  id: string
  projectId: string
  title: string
  description: string
  dueDate: Date
  completedDate?: Date
  status: "pending" | "completed" | "overdue"
  createdAt: Date
}

export const projectsService = {
  // Get all projects for a user
  async getProjects(userId: string): Promise<Project[]> {
    const q = query(collection(db, "projects"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Project[]
  },

  // Create a new project
  async createProject(userId: string, projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Update a project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const projectRef = doc(db, "projects", projectId)
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    }

    await updateDoc(projectRef, updateData)
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    const batch = writeBatch(db)

    // 1. Delete the project itself
    const projectRef = doc(db, "projects", projectId)
    batch.delete(projectRef)

    // 2. Delete all tasks for this project
    const tasksQ = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId)
    )
    const tasksSnap = await getDocs(tasksQ)
    tasksSnap.forEach((taskDoc) => {
      batch.delete(taskDoc.ref)
    })

    // 3. Delete all payments for this project
    const paymentsQ = query(
      collection(db, "projectPayments"),
      where("projectId", "==", projectId)
    )
    const paymentsSnap = await getDocs(paymentsQ)
    paymentsSnap.forEach((paymentDoc) => {
      batch.delete(paymentDoc.ref)
    })

    // 4. Commit everything at once
    await batch.commit()
  },

  // Get project payments
  async getProjectPayments(projectId: string): Promise<any[]> {
    const q = query(collection(db, "projectPayments"), where("projectId", "==", projectId), orderBy("dueDate", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as any[]
  },

  async createProjectPayment(userId: string, transactionData: Omit<ProjectPayment, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "projectPayments"), {
      ...transactionData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Update a project payment
  async updateProjectPayment(projectId: string, updates: Partial<ProjectPayment>): Promise<void> {
    const transactionRef = doc(db, "projectPayments", projectId)
    const updateData: any = { ...updates, updatedAt: Timestamp.now() }

    await updateDoc(transactionRef, updateData)
  },

  // Delete a transaction
  async deleteProjectPayment(projectId: string): Promise<void> {
    await deleteDoc(doc(db, "projectPayments", projectId))
  },
  // Get project milestones
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const q = query(collection(db, "projectMilestones"), where("projectId", "==", projectId), orderBy("dueDate", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate.toDate(),
      completedDate: doc.data().completedDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ProjectMilestone[]
  },

  // Add project milestone
  async addProjectMilestone(milestoneData: Omit<ProjectMilestone, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "projectMilestones"), {
      ...milestoneData,
      dueDate: Timestamp.fromDate(milestoneData.dueDate),
      completedDate: milestoneData.completedDate ? Timestamp.fromDate(milestoneData.completedDate) : null,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Update milestone status
  async updateMilestoneStatus(
    milestoneId: string,
    status: "pending" | "completed" | "overdue",
    completedDate?: Date,
  ): Promise<void> {
    const milestoneRef = doc(db, "projectMilestones", milestoneId)
    await updateDoc(milestoneRef, {
      status,
      completedDate: completedDate ? Timestamp.fromDate(completedDate) : null,
    })
  },
}
