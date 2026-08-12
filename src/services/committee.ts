"use client"

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
  writeBatch,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Committee,
  CommitteeMember,
  CommitteePayment,
  CommitteePayout,
  CommitteeSummary,
} from "@/types/committee"
import { toast } from "sonner"

// ─── Collections ─────────────────────────────────────────────────────────────

const COLLECTIONS = {
  committees: "committees",
  members: "committeeMembers",
  payments: "committeePayments",
  payouts: "committeePayouts",
} as const

// ─── Individual Export Functions ──────────────────────────────────────────────

export async function createCommittee(data: Partial<Committee>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.committees), {
    ...data,
    monthlyContribution: data.monthlyContribution || data.monthlyAmount || 10000,
    totalDurationMonths: data.totalDurationMonths || data.totalMonths || 12,
    drawMechanism: data.drawMechanism || data.payoutMethod || "lucky_draw",
    status: data.status || "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // For solo mode, auto-create a single member (the user)
  if (data.mode === "solo") {
    await addDoc(collection(db, COLLECTIONS.members), {
      committeeId: docRef.id,
      userId: data.userId || "",
      name: "Self (Solo Savings)",
      email: "",
      phone: "",
      payoutMonthAssigned: data.totalDurationMonths || 12,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  toast.success("Committee created successfully!")
  return docRef.id
}

export async function updateCommittee(committeeId: string, updates: Partial<Committee>): Promise<void> {
  const ref = doc(db, COLLECTIONS.committees, committeeId)
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
  toast.success("Committee updated successfully!")
}

export async function deleteCommittee(committeeId: string): Promise<void> {
  const batch = writeBatch(db)

  batch.delete(doc(db, COLLECTIONS.committees, committeeId))

  const membersQ = query(collection(db, COLLECTIONS.members), where("committeeId", "==", committeeId))
  const membersSnap = await getDocs(membersQ)
  membersSnap.forEach((d) => batch.delete(d.ref))

  const paymentsQ = query(collection(db, COLLECTIONS.payments), where("committeeId", "==", committeeId))
  const paymentsSnap = await getDocs(paymentsQ)
  paymentsSnap.forEach((d) => batch.delete(d.ref))

  const payoutsQ = query(collection(db, COLLECTIONS.payouts), where("committeeId", "==", committeeId))
  const payoutsSnap = await getDocs(payoutsQ)
  payoutsSnap.forEach((d) => batch.delete(d.ref))

  await batch.commit()
  toast.success("Committee deleted!")
}

// ─── Member Functions ─────────────────────────────────────────────────────────

export async function addCommitteeMember(data: Partial<CommitteeMember>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.members), {
    ...data,
    payoutMonthAssigned: data.payoutMonthAssigned || data.payoutMonth || null,
    status: data.status || "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  toast.success(`Member ${data.name} added!`)
  return docRef.id
}

export async function updateCommitteeMember(memberId: string, updates: Partial<CommitteeMember>): Promise<void> {
  const ref = doc(db, COLLECTIONS.members, memberId)
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
  toast.success("Member updated!")
}

export async function deleteCommitteeMember(memberId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.members, memberId))
  toast.success("Member removed!")
}

// ─── Payment Functions ────────────────────────────────────────────────────────

export async function recordMemberPayment(data: {
  committeeId: string
  memberId: string
  userId?: string
  monthNumber: number
  amountPaid: number
  status: any
  paymentDate: string
  paymentMethod: any
  notes?: string
  penaltyApplied?: number
}): Promise<string> {
  // Check if existing record
  const q = query(
    collection(db, COLLECTIONS.payments),
    where("committeeId", "==", data.committeeId),
    where("memberId", "==", data.memberId),
    where("monthNumber", "==", data.monthNumber)
  )
  const snap = await getDocs(q)

  if (!snap.empty) {
    const existingId = snap.docs[0].id
    await updateDoc(doc(db, COLLECTIONS.payments, existingId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    toast.success("Payment record updated!")
    return existingId
  } else {
    const docRef = await addDoc(collection(db, COLLECTIONS.payments), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    toast.success("Payment recorded!")
    return docRef.id
  }
}

// ─── Payout Functions ─────────────────────────────────────────────────────────

export async function recordCommitteePayout(data: {
  committeeId: string
  userId?: string
  monthNumber: number
  recipientId: string
  recipientName: string
  grossAmount: number
  commissionBidded?: number
  netPayoutAmount: number
  payoutDate: string
  notes?: string
}): Promise<string> {
  const q = query(
    collection(db, COLLECTIONS.payouts),
    where("committeeId", "==", data.committeeId),
    where("monthNumber", "==", data.monthNumber)
  )
  const snap = await getDocs(q)

  if (!snap.empty) {
    const existingId = snap.docs[0].id
    await updateDoc(doc(db, COLLECTIONS.payouts, existingId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    toast.success(`Payout for Month ${data.monthNumber} updated!`)
    return existingId
  } else {
    const docRef = await addDoc(collection(db, COLLECTIONS.payouts), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    toast.success(`Payout recorded for ${data.recipientName}!`)
    return docRef.id
  }
}

export async function deleteCommitteePayout(payoutId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.payouts, payoutId))
  toast.success("Payout deleted!")
}

// ─── Public Fetch Function ───────────────────────────────────────────────────

export async function getCommitteePublicData(committeeId: string) {
  const committeeRef = doc(db, COLLECTIONS.committees, committeeId)
  const committeeSnap = await getDoc(committeeRef)

  if (!committeeSnap.exists()) return null

  const rawData = committeeSnap.data()
  const committee = {
    id: committeeSnap.id,
    ...rawData,
    monthlyContribution: rawData.monthlyContribution || rawData.monthlyAmount || 10000,
    totalDurationMonths: rawData.totalDurationMonths || rawData.totalMonths || 12,
    drawMechanism: rawData.drawMechanism || rawData.payoutMethod || "lucky_draw",
  } as Committee

  const membersQ = query(collection(db, COLLECTIONS.members), where("committeeId", "==", committeeId))
  const membersSnap = await getDocs(membersQ)
  const members = membersSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      payoutMonthAssigned: data.payoutMonthAssigned || data.payoutMonth,
    }
  }) as CommitteeMember[]

  const payoutsQ = query(collection(db, COLLECTIONS.payouts), where("committeeId", "==", committeeId))
  const payoutsSnap = await getDocs(payoutsQ)
  const payouts = payoutsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      monthNumber: data.monthNumber || data.month,
      recipientName: data.recipientName || data.memberName,
      netPayoutAmount: data.netPayoutAmount || data.netPayout || data.grossAmount,
    }
  }) as CommitteePayout[]

  const paymentsQ = query(collection(db, COLLECTIONS.payments), where("committeeId", "==", committeeId))
  const paymentsSnap = await getDocs(paymentsQ)
  const payments = paymentsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      monthNumber: data.monthNumber || data.month,
      amountPaid: data.amountPaid || data.amount,
    }
  }) as CommitteePayment[]

  return { committee, members, payouts, payments }
}
