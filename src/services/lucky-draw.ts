import type { LuckyDraw, LuckyDrawStatus, LuckyDrawParticipant, CreateLuckyDrawInput } from "@/types/lucky-draw"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

const COLLECTION = "lucky_draws"

function timestampToDate(value: any): Date {
  if (value?.toDate) return value.toDate()
  if (value instanceof Date) return value
  return new Date(value)
}

function generateCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

class LuckyDrawService {
  async createCommitteeDraw(input: {
    committeeId: string
    monthNumber: number
    committeeName: string
    currency: string
    potAmount: number
    members: { id: string; name: string; phone?: string }[]
  }): Promise<LuckyDraw> {
    // Reuse an existing room for this committee + month if one exists
    const roomKey = `${input.committeeId}_m${input.monthNumber}`
    const existing = await this.getDrawByRoomKey(roomKey)
    if (existing) return existing

    let code = generateCode()
    let attempts = 0
    while (attempts < 5) {
      const collision = await this.getDrawByCode(code)
      if (!collision) break
      code = generateCode()
      attempts++
    }

    const user = (typeof window !== "undefined" && (window as any).__LD_USER__) as
      | { uid: string; name: string }
      | undefined
    const hostName =
      user?.name ||
      (typeof window !== "undefined" && (window as any).__LD_USER_NAME__) ||
      "Host"

    const participants: LuckyDrawParticipant[] = input.members.map((m) => ({
      userId: m.id,
      name: m.name,
      phone: m.phone,
      memberId: m.id,
      joinedAt: new Date(),
    }))

    const ref = doc(collection(db, COLLECTION))
    const data = {
      code,
      codeLower: code.toLowerCase(),
      hostId: user?.uid || "",
      hostName,
      title: `${input.committeeName} — Month ${input.monthNumber} Draw`,
      prize: "Committee payout pool",
      status: "waiting" as LuckyDrawStatus,
      participants,
      winnerId: "",
      winnerName: "",
      committeeId: input.committeeId,
      monthNumber: input.monthNumber,
      roomKey,
      currency: input.currency,
      potAmount: input.potAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(ref, data)

    return {
      id: ref.id,
      ...data,
      winnerId: undefined,
      winnerName: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getDrawsByCommittee(committeeId: string): Promise<LuckyDraw[]> {
    const q = query(collection(db, COLLECTION), where("committeeId", "==", committeeId))
    const snap = await getDocs(q)
    const draws = snap.docs.map((d) => this.mapDraw(d.id, d.data()))
    return draws.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  listenDrawsByCommittee(
    committeeId: string,
    onUpdate: (draws: LuckyDraw[]) => void,
  ): () => void {
    const q = query(collection(db, COLLECTION), where("committeeId", "==", committeeId))
    return onSnapshot(q, (snap) => {
      const draws = snap.docs
        .map((d) => this.mapDraw(d.id, d.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      onUpdate(draws)
    })
  }

  async getDrawByRoomKey(roomKey: string): Promise<LuckyDraw | null> {
    const q = query(collection(db, COLLECTION), where("roomKey", "==", roomKey), limit(1))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return this.mapDraw(docSnap.id, docSnap.data())
  }

  async createDraw(input: CreateLuckyDrawInput): Promise<LuckyDraw> {
    let code = generateCode()
    let attempts = 0
    while (attempts < 5) {
      const existing = await this.getDrawByCode(code)
      if (!existing) break
      code = generateCode()
      attempts++
    }

    const user = (typeof window !== "undefined" && (window as any).__LD_USER__) as
      | { uid: string; name: string }
      | undefined
    const fallbackName =
      (typeof window !== "undefined" && (window as any).__LD_USER_NAME__) || "Host"
    const participant: LuckyDrawParticipant = {
      userId: user?.uid || "",
      name: user?.name || fallbackName,
      joinedAt: new Date(),
    }

    const ref = doc(collection(db, COLLECTION))
    const data = {
      code,
      codeLower: code.toLowerCase(),
      hostId: user?.uid || "",
      hostName: user?.name || fallbackName,
      title: input.title,
      prize: input.prize || "",
      status: "waiting" as LuckyDrawStatus,
      participants: [participant],
      winnerId: "",
      winnerName: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(ref, data)

    return {
      id: ref.id,
      ...data,
      winnerId: undefined,
      winnerName: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getDraw(id: string): Promise<LuckyDraw | null> {
    const snap = await getDoc(doc(db, COLLECTION, id))
    if (!snap.exists()) return null
    return this.mapDraw(snap.id, snap.data())
  }

  async getDrawByCode(code: string): Promise<LuckyDraw | null> {
    const q = query(
      collection(db, COLLECTION),
      where("codeLower", "==", code.trim().toLowerCase()),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return this.mapDraw(docSnap.id, docSnap.data())
  }

  async getMyDraws(userId: string): Promise<LuckyDraw[]> {
    const q = query(collection(db, COLLECTION), where("hostId", "==", userId))
    const snap = await getDocs(q)
    const draws = snap.docs.map((d) => this.mapDraw(d.id, d.data()))
    return draws.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  listenDraw(id: string, onUpdate: (draw: LuckyDraw | null) => void): () => void {
    const unsub = onSnapshot(doc(db, COLLECTION, id), (snap) => {
      if (!snap.exists()) {
        onUpdate(null)
        return
      }
      onUpdate(this.mapDraw(snap.id, snap.data()))
    })
    return unsub
  }

  async joinDraw(id: string, participant: LuckyDrawParticipant): Promise<void> {
    const draw = await this.getDraw(id)
    if (!draw) throw new Error("Draw not found")
    if (draw.status !== "waiting") throw new Error("Draw has already started")

    const existing = draw.participants.some((p) => p.userId === participant.userId)
    if (existing) return

    await updateDoc(doc(db, COLLECTION, id), {
      participants: [...draw.participants, participant],
      updatedAt: serverTimestamp(),
    })
  }

  async leaveDraw(id: string, userId: string): Promise<void> {
    const draw = await this.getDraw(id)
    if (!draw) return

    const participants = draw.participants.filter((p) => p.userId !== userId)
    await updateDoc(doc(db, COLLECTION, id), {
      participants,
      updatedAt: serverTimestamp(),
    })
  }

  async startDraw(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status: "drawing",
      drawStartedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async completeDraw(id: string, winner: LuckyDrawParticipant): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status: "completed",
      winnerId: winner.userId,
      winnerName: winner.name,
      updatedAt: serverTimestamp(),
    })
  }

  async resetDraw(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status: "waiting",
      winnerId: "",
      winnerName: "",
      drawStartedAt: null,
      updatedAt: serverTimestamp(),
    })
  }

  async deleteDraw(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status: "completed",
      updatedAt: serverTimestamp(),
    })
  }

  private mapDraw(id: string, data: any): LuckyDraw {
    return {
      id,
      code: data.code || "",
      codeLower: data.codeLower || "",
      hostId: data.hostId || "",
      hostName: data.hostName || "",
      title: data.title || "Lucky Draw",
      prize: data.prize || "",
      status: data.status || "waiting",
      participants: (data.participants || []).map((p: any) => ({
        userId: p.userId || "",
        name: p.name || "Guest",
        email: p.email || "",
        phone: p.phone || "",
        memberId: p.memberId || "",
        joinedAt: timestampToDate(p.joinedAt),
      })),
      winnerId: data.winnerId || undefined,
      winnerName: data.winnerName || undefined,
      committeeId: data.committeeId || undefined,
      monthNumber: data.monthNumber || undefined,
      roomKey: data.roomKey || undefined,
      currency: data.currency || undefined,
      potAmount: data.potAmount || undefined,
      drawStartedAt: data.drawStartedAt
        ? timestampToDate(data.drawStartedAt)
        : undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  }
}

export const luckyDrawService = new LuckyDrawService()