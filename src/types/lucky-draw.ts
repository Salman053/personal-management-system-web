export type LuckyDrawStatus = "waiting" | "drawing" | "completed"

export interface LuckyDrawParticipant {
  userId: string
  name: string
  email?: string
  phone?: string
  memberId?: string
  joinedAt: Date
}

export interface LuckyDraw {
  id: string
  code: string
  codeLower: string
  hostId: string
  hostName: string
  title: string
  prize?: string
  status: LuckyDrawStatus
  participants: LuckyDrawParticipant[]
  winnerId?: string
  winnerName?: string
  // Committee-linked draws
  committeeId?: string
  monthNumber?: number
  roomKey?: string
  currency?: string
  potAmount?: number
  drawStartedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateLuckyDrawInput {
  title: string
  prize?: string
}
