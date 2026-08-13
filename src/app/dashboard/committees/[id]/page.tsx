"use client"

import React, { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMainContext } from "@/contexts/app-context"
import { Committee, CommitteeMember, CommitteePayment, CommitteePayout } from "@/types/committee"
import {
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  recordMemberPayment,
  recordCommitteePayout,
  deleteCommitteePayout,
  deletePaymentByCell,
  bulkDeleteMemberPayments,
  deletePaymentRecord,
} from "@/services/committee"

import { PaymentGrid } from "@/components/committee/payment-grid"
import { SoloSimulator } from "@/components/committee/solo-simulator"
import { MemberDialog } from "@/components/committee/member-dialog"
import { PaymentDialog } from "@/components/committee/payment-dialog"
import { PayoutRecordDialog } from "@/components/committee/payout-record-dialog"
import { LuckyDrawModal } from "@/components/committee/lucky-draw-modal"
import { CommitteeDrawDialog } from "@/components/committee/committee-draw-dialog"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Users,
  User,
  Plus,
  Trophy,
  Gift,
  Copy,
  Check,
  Mail,
  Edit3,
  Trash2,
  Share2,
  Calendar,
  DollarSign,
  Award,
  Sparkles,
  XCircle,
} from "lucide-react"

export default function CommitteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.id
  const router = useRouter()

  const {
    committees = [],
    committeeMembers = [],
    committeePayments = [],
    committeePayouts = [],
  } = useMainContext()

  // Filter current committee data
  const committee = committees.find((c: Committee) => c.id === committeeId) as Committee | undefined
  const members = committeeMembers.filter((m: CommitteeMember) => m.committeeId === committeeId)
  const payments = committeePayments.filter((p: CommitteePayment) => p.committeeId === committeeId)
  const payouts = committeePayouts.filter((p: CommitteePayout) => p.committeeId === committeeId)

  // State for modals
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null)

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ member: CommitteeMember; monthNumber: number } | null>(null)

  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)
  const [selectedPayoutMonth, setSelectedPayoutMonth] = useState<number>(1)
  const [editingPayout, setEditingPayout] = useState<CommitteePayout | null>(null)

  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false)
  const [isCommitteeDrawOpen, setIsCommitteeDrawOpen] = useState(false)
  const [drawMonthNumber, setDrawMonthNumber] = useState<number>(1)

  const [copiedLink, setCopiedLink] = useState(false)
  const [reminderSending, setReminderSending] = useState<string | null>(null)

  if (!committee) {
    return (
      <div className="mx-auto text-center space-y-4 px-4 py-12">
        <h2 className="text-2xl font-bold">Committee Not Found</h2>
        <p className="text-muted-foreground">The requested committee does not exist or was deleted.</p>
        <Link href="/dashboard/committees">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Committees
          </Button>
        </Link>
      </div>
    )
  }

  const isSolo = committee.mode === "solo"
  const totalLumpSum = committee.monthlyContribution * committee.totalDurationMonths

  // Handlers
  const copyShareLink = () => {
    const url = `${window.location.origin}/committee-portal?id=${committee.id}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Member Handlers
  const handleOpenAddMember = () => {
    setEditingMember(null)
    setIsMemberDialogOpen(true)
  }

  const handleOpenEditMember = (member: CommitteeMember) => {
    setEditingMember(member)
    setIsMemberDialogOpen(true)
  }

  const handleSaveMember = async (data: Partial<CommitteeMember>) => {
    if (editingMember) {
      await updateCommitteeMember(editingMember.id, data)
    } else {
      await addCommitteeMember({
        committeeId: committee.id,
        userId: committee.userId,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        payoutMonthAssigned: data.payoutMonthAssigned,
        status: "active",
      })
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return
    try {
      await deleteCommitteeMember(id)
    } catch (err) {
      console.error(err)
    }
  }

  // Payment Cell Click
  const handleCellClick = (member: CommitteeMember, monthNumber: number) => {
    setSelectedCell({ member, monthNumber })
    setIsPaymentDialogOpen(true)
  }

  const handleSavePayment = async (data: {
    status: any
    amountPaid: number
    paymentDate: string
    paymentMethod: any
    notes?: string
    penaltyApplied?: number
  }) => {
    if (!selectedCell) return
    await recordMemberPayment({
      committeeId: committee.id,
      userId: committee.userId,
      memberId: selectedCell.member.id,
      monthNumber: selectedCell.monthNumber,
      amountPaid: data.amountPaid,
      status: data.status,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      penaltyApplied: data.penaltyApplied,
    })
  }

  // Delete single payment (from PaymentDialog)
  const handleDeletePayment = async () => {
    if (!selectedCell) return
    await deletePaymentByCell(committee.id, selectedCell.member.id, selectedCell.monthNumber)
  }

  // Bulk delete all payments for a member
  const handleBulkDeleteMemberPayments = async (member: CommitteeMember) => {
    const memberPaymentCount = payments.filter((p) => p.memberId === member.id).length
    if (memberPaymentCount === 0) {
      return
    }
    if (!window.confirm(`Remove all ${memberPaymentCount} payment record(s) for ${member.name}? This cannot be undone.`)) return
    try {
      await bulkDeleteMemberPayments(committee.id, member.id)
    } catch (err) {
      console.error(err)
    }
  }

  // Payout & Lucky Draw Handlers
  const handleOpenLuckyDraw = (monthNumber: number) => {
    setDrawMonthNumber(monthNumber)
    setIsLuckyDrawOpen(true)
  }

  const handleSelectDrawWinner = async (winnerMember: CommitteeMember) => {
    console.log(winnerMember)
    const grossAmount = committee.monthlyContribution * (members.length || 1)
    await recordCommitteePayout({
      committeeId: committee.id,
      userId: committee.userId,
      monthNumber: drawMonthNumber,
      recipientId: winnerMember.id,
      recipientName: winnerMember.name,
      grossAmount,
      commissionBidded: 0,
      netPayoutAmount: grossAmount,
      payoutDate: new Date().toISOString().substring(0, 10),
      notes: `Winner of Month ${drawMonthNumber} Lucky Draw`,
    })

    if (!winnerMember.payoutMonthAssigned) {
      await updateCommitteeMember(winnerMember.id, { payoutMonthAssigned: drawMonthNumber })
    }
  }

  const handleOpenRecordPayout = (monthNumber: number) => {
    setSelectedPayoutMonth(monthNumber)
    const existing = payouts.find((p) => p.monthNumber === monthNumber)
    setEditingPayout(existing || null)
    setIsPayoutDialogOpen(true)
  }

  const handleSavePayout = async (data: {
    recipientId: string
    recipientName: string
    grossAmount: number
    commissionBidded?: number
    netPayoutAmount: number
    payoutDate: string
    notes?: string
  }) => {
    await recordCommitteePayout({
      committeeId: committee.id,
      userId: committee.userId,
      monthNumber: selectedPayoutMonth,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      grossAmount: data.grossAmount,
      commissionBidded: data.commissionBidded || 0,
      netPayoutAmount: data.netPayoutAmount,
      payoutDate: data.payoutDate,
      notes: data.notes,
    })
  }

  // Email Reminder
  const handleSendEmailReminder = async (member: CommitteeMember, monthNumber: number) => {
    if (!member.email) return
    const reminderKey = `${member.id}_${monthNumber}`
    setReminderSending(reminderKey)
    try {
      const res = await fetch("/api/email/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: member.email,
          memberName: member.name,
          committeeName: committee.name,
          monthNumber,
          amount: committee.monthlyContribution,
          currency: committee.currency,
        }),
      })
      if (res.ok) {
        alert(`Reminder email sent successfully to ${member.name}!`)
      } else {
        alert("Could not send reminder email. Check backend configuration.")
      }
    } catch (err) {
      console.error(err)
      alert("Error sending reminder email.")
    } finally {
      setReminderSending(null)
    }
  }

  // Eligible members for Lucky Draw (those who haven't won a payout yet)
  const wonRecipientIds = new Set(payouts.map((p) => p.recipientId))
  const eligibleMembersForDraw = members.filter((m) => !wonRecipientIds.has(m.id))

  // Find existing payment for selected cell
  const selectedPayment = selectedCell
    ? payments.find((p) => p.memberId === selectedCell.member.id && p.monthNumber === selectedCell.monthNumber)
    : null

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Top Navigation - Mobile friendly */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <Link href="/dashboard/committees" className="w-full sm:w-auto">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start">
            <ArrowLeft className="h-4 w-4" /> Back to Committees
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={copyShareLink}
          className="gap-1.5 text-xs w-full sm:w-auto justify-center"
        >
          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
          {copiedLink ? "Copied!" : "Share Public Link"}
        </Button>
      </div>

      {/* Header Banner - Mobile optimized */}
      <Card className="bg-gradient-to-r from-indigo-900/40 via-background to-purple-900/30 border-indigo-500/30 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={isSolo ? "bg-emerald-600" : "bg-indigo-600"}>
                  {isSolo ? <User className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                  {isSolo ? "Solo" : "Group"}
                </Badge>
                <Badge variant="outline" className="capitalize">{committee.status}</Badge>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground break-words">
                {committee.name}
              </h1>
              {committee.description && (
                <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl break-words">
                  {committee.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="flex-1 sm:flex-none p-3 rounded-xl bg-card border border-border text-center sm:text-right min-w-[100px] sm:min-w-[130px]">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium">Monthly</span>
                <span className="text-base sm:text-xl font-bold text-foreground">
                  {committee.currency} {committee.monthlyContribution.toLocaleString()}
                </span>
              </div>

              <div className="flex-1 sm:flex-none p-3 rounded-xl bg-primary/10 border border-primary/20 text-center sm:text-right min-w-[110px] sm:min-w-[150px]">
                <span className="text-[10px] sm:text-xs text-primary font-semibold block">Total Pool</span>
                <span className="text-lg sm:text-2xl font-black text-primary">
                  {committee.currency} {totalLumpSum.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Feature Tabs - Mobile optimized */}
      <Tabs defaultValue={isSolo ? "simulator" : "matrix"} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full min-w-[320px] sm:min-w-0">
            {!isSolo && <TabsTrigger value="matrix" className="text-xs sm:text-sm">Matrix</TabsTrigger>}
            {!isSolo && <TabsTrigger value="members" className="text-xs sm:text-sm">Members ({members.length})</TabsTrigger>}
            {!isSolo && <TabsTrigger value="payouts" className="text-xs sm:text-sm">Payouts ({payouts.length})</TabsTrigger>}
            <TabsTrigger value="simulator" className="text-xs sm:text-sm">Simulator</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: PAYMENT MATRIX */}
        {!isSolo && (
          <TabsContent value="matrix" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold text-foreground">Payment Tracker</h3>
                <p className="text-xs text-muted-foreground">Tap any cell to record payment</p>
              </div>
              <Button size="sm" onClick={handleOpenAddMember} className="gap-1.5 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </div>

            <div className="overflow-x-auto">
              <PaymentGrid
                committee={committee}
                members={members}
                payments={payments}
                payouts={payouts}
                onCellClick={handleCellClick}
                onPayoutClick={handleOpenRecordPayout}
                onLuckyDrawClick={handleOpenLuckyDraw}
                onSendReminderClick={handleSendEmailReminder}
              />
            </div>
          </TabsContent>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {!isSolo && (
          <TabsContent value="members" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Committee Members</h3>
                <p className="text-xs text-muted-foreground hidden sm:block">Manage participants and assign payout months.</p>
              </div>
              <Button size="sm" onClick={handleOpenAddMember} className="gap-1.5 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Member</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Phone</TableHead>
                      <TableHead className="text-xs sm:text-sm">Payout</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No members added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-semibold text-foreground text-xs sm:text-sm">
                            {member.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                            {member.email || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                            {member.phone || "—"}
                          </TableCell>
                          <TableCell>
                            {member.payoutMonthAssigned ? (
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs">
                                M{member.payoutMonthAssigned}
                              </Badge>
                            ) : (
                              <span className="text-[10px] sm:text-xs text-muted-foreground italic">Draw</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => handleOpenEditMember(member)}
                              >
                                <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500 hover:text-orange-600"
                                title="Remove all payment records"
                                onClick={() => handleBulkDeleteMemberPayments(member)}
                              >
                                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 3: PAYOUTS & LUCKY DRAW HISTORY */}
        {!isSolo && (
          <TabsContent value="payouts" className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Payouts & Draw History</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Track which member received payout for each month.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: committee.totalDurationMonths }).map((_, idx) => {
                const mNum = idx + 1
                const payout = payouts.find((p) => p.monthNumber === mNum)

                return (
                  <Card key={mNum} className={`border transition-all ${payout ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`}>
                    <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <Badge variant="outline" className="text-xs">Month {mNum}</Badge>
                        {payout && <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] sm:text-xs">PAID</Badge>}
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold mt-1 break-words">
                        {payout ? payout.recipientName : "No Winner"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 text-sm">
                      {payout ? (
                        <div className="space-y-1 text-xs sm:text-sm">
                          <div className="flex flex-wrap justify-between text-muted-foreground">
                            <span>Net:</span>
                            <span className="font-bold text-foreground">
                              {committee.currency} {payout.netPayoutAmount.toLocaleString()}
                            </span>
                          </div>
                          {payout.commissionBidded ? (
                            <div className="flex flex-wrap justify-between text-amber-600 dark:text-amber-400">
                              <span>Discount:</span>
                              <span>{committee.currency} {payout.commissionBidded.toLocaleString()}</span>
                            </div>
                          ) : null}
                          <div className="flex flex-wrap justify-between text-muted-foreground">
                            <span>Date:</span>
                            <span className="text-xs">{payout.payoutDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 text-xs sm:text-sm"
                            onClick={() => handleOpenLuckyDraw(mNum)}
                          >
                            <Gift className="h-4 w-4" /> Lucky Draw
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5"
                            onClick={() => {
                              setDrawMonthNumber(mNum)
                              setIsCommitteeDrawOpen(true)
                            }}
                          >
                            <Sparkles className="h-4 w-4 text-primary" /> Live Draw
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOpenRecordPayout(mNum)}
                          >
                            Record Payout
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        )}

        {/* TAB 4: SOLO SAVINGS SIMULATOR */}
        <TabsContent value="simulator">
          <SoloSimulator
            committee={committee}
            payments={payments}
            onRecordMonthlyDeposit={async (mNum) => {
              await recordMemberPayment({
                committeeId: committee.id,
                userId: committee.userId,
                memberId: "solo_owner",
                monthNumber: mNum,
                amountPaid: committee.monthlyContribution,
                status: "paid",
                paymentDate: new Date().toISOString().substring(0, 10),
                paymentMethod: "bank_transfer",
                notes: "Solo deposit milestone",
              })
            }}
            onRemoveDeposit={async (pid, mNum) => {
              deletePaymentRecord(pid)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* MODALS - These remain the same as they handle their own responsiveness */}
      <MemberDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        member={editingMember}
        totalDurationMonths={committee.totalDurationMonths}
        onSave={handleSaveMember}
      />

      {selectedCell && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          memberName={selectedCell.member.name}
          monthNumber={selectedCell.monthNumber}
          expectedAmount={committee.monthlyContribution}
          currency={committee.currency}
          existingPayment={selectedPayment}
          onSave={handleSavePayment}
          onDelete={handleDeletePayment}
        />
      )}

      <PayoutRecordDialog
        open={isPayoutDialogOpen}
        onOpenChange={setIsPayoutDialogOpen}
        monthNumber={selectedPayoutMonth}
        expectedTotalPayout={totalLumpSum}
        currency={committee.currency}
        drawMechanism={committee.drawMechanism}
        members={members}
        existingPayout={editingPayout}
        onSave={handleSavePayout}
      />

      <LuckyDrawModal
        open={isLuckyDrawOpen}
        onOpenChange={setIsLuckyDrawOpen}
        monthNumber={drawMonthNumber}
        currency={committee.currency}
        totalPoolAmount={committee.monthlyContribution * (members.length || 1)}
        eligibleMembers={eligibleMembersForDraw}
        onSelectWinner={handleSelectDrawWinner}
      />

      <CommitteeDrawDialog
        open={isCommitteeDrawOpen}
        onOpenChange={setIsCommitteeDrawOpen}
        committeeId={committee.id}
        committeeName={committee.name}
        monthNumber={drawMonthNumber}
        currency={committee.currency}
        totalPoolAmount={committee.monthlyContribution * (members.length || 1)}
        eligibleMembers={eligibleMembersForDraw}
        onWinnerConfirmed={handleSelectDrawWinner}
      />
    </div>
  )
}