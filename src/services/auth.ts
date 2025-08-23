import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
}

export const authService = {
  // Register new user
  async register(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    // Update profile
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)

    return user
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  // Sign out user
  async signOut() {
    await signOut(auth)
  },

  // Reset password
  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }

    return null
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const userRef = doc(db, "users", uid)
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true },
    )
  },
}
