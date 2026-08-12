// ─── Committee / ROSCA Types ─────────────────────────────────────────────────

export type CommitteeMode = "group" | "solo"
export type CommitteeStatus = "active" | "completed" | "paused"
export type CommitteeDrawMechanism = "lucky_draw" | "bidding" | "fixed_order"
export type PayoutMethod = CommitteeDrawMechanism
export type PaymentStatus = "paid" | "pending" | "late"
export type MemberPaymentStatus = PaymentStatus
export type PaymentMethod = "bank_transfer" | "cash" | "easypaisa" | "jazzcash" | "other"

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Committee {
  id: string
  userId: string              // organizer / owner
  name: string
  description?: string
  mode: CommitteeMode
  status: CommitteeStatus
  monthlyContribution: number // fixed contribution per member per month
  monthlyAmount?: number      // alias
  totalDurationMonths: number // duration (e.g., 12)
  totalMonths?: number        // alias
  startMonth: string          // e.g. "2026-08"
  startDate?: any             // Firestore Timestamp or ISO string
  drawMechanism: CommitteeDrawMechanism
  payoutMethod?: PayoutMethod
  currency: string            // default "PKR"
  gracePeriodDays?: number    // days before marking payment as "late"
  lateFeeAmount?: number      // optional penalty for late payment
  latePenaltyAmount?: number  // alias
  createdAt?: any
  updatedAt?: any
}

export interface CommitteeMember {
  id: string
  committeeId: string
  userId?: string             // owner reference
  name: string
  email?: string
  phone?: string
  payoutMonthAssigned?: number// assigned month to receive payout (1-indexed)
  payoutMonth?: number        // alias
  status?: string
  hasReceivedPayout?: boolean
  bidAmount?: number          // commission amount offered in bidding
  totalPaid?: number
  totalDue?: number
  createdAt?: any
  updatedAt?: any
}

export interface CommitteePayment {
  id: string
  committeeId: string
  memberId: string
  userId?: string
  memberName?: string
  monthNumber: number         // month number (1-indexed)
  month?: number              // alias
  monthLabel?: string         // e.g., "Jan 2026"
  amountPaid: number
  amount?: number             // alias
  status: PaymentStatus
  paymentDate: string         // e.g. "2026-08-12"
  paidDate?: any              // alias
  paymentMethod: PaymentMethod
  penaltyApplied?: number
  latePenalty?: number
  notes?: string
  createdAt?: any
  updatedAt?: any
}

export interface CommitteePayout {
  id: string
  committeeId: string
  monthNumber: number         // month number (1-indexed)
  month?: number              // alias
  recipientId: string
  recipientName: string
  memberName?: string         // alias
  grossAmount: number
  totalPool?: number          // alias
  commissionBidded?: number
  commission?: number         // alias
  netPayoutAmount: number
  netPayout?: number          // alias
  payoutDate: string
  paidDate?: any              // alias
  notes?: string
  createdAt?: any
  updatedAt?: any
}

// ─── Lucky Draw State ────────────────────────────────────────────────────────

export interface LuckyDrawState {
  committeeId: string
  monthNumber: number
  eligibleMembers: CommitteeMember[]
  winner?: CommitteeMember
  isDrawing: boolean
  drawHistory: LuckyDrawResult[]
}

export interface LuckyDrawResult {
  monthNumber: number
  winnerId: string
  winnerName: string
  drawnAt: any
  grossAmount: number
}

// ─── Summary Helpers ─────────────────────────────────────────────────────────

export interface CommitteeSummary {
  totalCollected: number
  totalPending: number
  totalMembers: number
  collectionRate: number
  currentMonth: number
  totalDurationMonths: number
  monthlyPool: number
  paidThisMonth: number
  unpaidThisMonth: number
}
