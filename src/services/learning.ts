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
import type { LearningItem } from "@/contexts/app-context"

export const learningService = {
  // Get all learning items for a user
  async getLearningItems(userId: string): Promise<LearningItem[]> {
    const q = query(collection(db, "learning"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as LearningItem[]
  },

  // Create a new learning item
  async createLearningItem(
    userId: string,
    learningData: Omit<LearningItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "learning"), {
      ...learningData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Update a learning item
  async updateLearningItem(learningId: string, updates: Partial<LearningItem>): Promise<void> {
    const learningRef = doc(db, "learning", learningId)
    await updateDoc(learningRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete a learning item and all its children
  async deleteLearningItem(learningId: string): Promise<void> {
    await deleteDoc(doc(db, "learning", learningId))
    // Note: In a real app, you'd also delete all child items
  },

  // Get learning items by parent
  async getLearningItemsByParent(userId: string, parentId: string): Promise<LearningItem[]> {
    const q = query(
      collection(db, "learning"),
      where("userId", "==", userId),
      where("parentId", "==", parentId),
      orderBy("createdAt", "asc"),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as LearningItem[]
  },

  // Calculate progress for a learning item based on its children
  calculateProgress(item: LearningItem, allItems: LearningItem[]): number {
    const children = allItems.filter((child) => child.parentId === item.id)

    if (children.length === 0) {
      return item.completed ? 100 : item.progress
    }

    const totalProgress = children.reduce((sum, child) => {
      return sum + this.calculateProgress(child, allItems)
    }, 0)

    return Math.round(totalProgress / children.length)
  },

  // Get predefined learning templates
  getPredefinedTemplates() {
    return [
      {
        title: "Web Development Fundamentals",
        description: "Learn the basics of web development",
        topics: [
          {
            title: "HTML & CSS",
            subtopics: ["HTML Basics", "CSS Styling", "Responsive Design", "Flexbox & Grid"],
          },
          {
            title: "JavaScript",
            subtopics: ["Variables & Functions", "DOM Manipulation", "Async Programming", "ES6+ Features"],
          },
          {
            title: "React",
            subtopics: ["Components", "State & Props", "Hooks", "Context API"],
          },
        ],
      },
      {
        title: "Data Science with Python",
        description: "Master data science fundamentals",
        topics: [
          {
            title: "Python Basics",
            subtopics: ["Syntax & Variables", "Data Structures", "Functions", "Object-Oriented Programming"],
          },
          {
            title: "Data Analysis",
            subtopics: ["Pandas", "NumPy", "Data Cleaning", "Exploratory Data Analysis"],
          },
          {
            title: "Machine Learning",
            subtopics: ["Scikit-learn", "Supervised Learning", "Unsupervised Learning", "Model Evaluation"],
          },
        ],
      },
      {
        title: "Digital Marketing",
        description: "Learn modern digital marketing strategies",
        topics: [
          {
            title: "SEO",
            subtopics: ["Keyword Research", "On-Page SEO", "Link Building", "Technical SEO"],
          },
          {
            title: "Social Media Marketing",
            subtopics: ["Content Strategy", "Platform Optimization", "Paid Advertising", "Analytics"],
          },
          {
            title: "Email Marketing",
            subtopics: ["List Building", "Campaign Design", "Automation", "A/B Testing"],
          },
        ],
      },
    ]
  },
}
