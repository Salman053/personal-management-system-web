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
  const [drawMonthNumber, setDrawMonthNumber] = useState<number>(1)

  const [copiedLink, setCopiedLink] = useState(false)
  const [reminderSending, setReminderSending] = useState<string | null>(null)

  if (!committee) {
    return (
      <div className=" mx-auto text-center space-y-4">
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
    // Record payout automatically for this winner
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

    // Assign payout month to member if not set
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
    <div className=" container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 ">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/committees">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to All Committees
          </Button>
        </Link>

        <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5 text-xs">
          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
          {copiedLink ? "Link Copied!" : "Public Verification Link"}
        </Button>
      </div>

      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-indigo-900/40 via-background to-purple-900/30 border-indigo-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={isSolo ? "bg-emerald-600" : "bg-indigo-600"}>
                  {isSolo ? <User className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                  {isSolo ? "Solo Savings" : "Group Committee"}
                </Badge>
                <Badge variant="outline">{committee.status.toUpperCase()}</Badge>
              </div>

              <h1 className="text-3xl font-extrabold text-foreground">{committee.name}</h1>
              {committee.description && (
                <p className="text-muted-foreground text-sm max-w-2xl">{committee.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-xl bg-card border border-border text-right min-w-[130px]">
                <span className="text-xs text-muted-foreground block font-medium">Monthly Contribution</span>
                <span className="text-xl font-bold text-foreground">
                  {committee.currency} {committee.monthlyContribution.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-right min-w-[150px]">
                <span className="text-xs text-primary font-semibold block">Total Lump Sum Pool</span>
                <span className="text-2xl font-black text-primary">
                  {committee.currency} {totalLumpSum.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Feature Tabs */}
      <Tabs defaultValue={isSolo ? "simulator" : "matrix"} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          {!isSolo && <TabsTrigger value="matrix">Payment Matrix</TabsTrigger>}
          {!isSolo && <TabsTrigger value="members">Members ({members.length})</TabsTrigger>}
          {!isSolo && <TabsTrigger value="payouts">Payouts & Draw ({payouts.length})</TabsTrigger>}
          <TabsTrigger value="simulator">Solo Simulator</TabsTrigger>
        </TabsList>

        {/* TAB 1: PAYMENT MATRIX */}
        {!isSolo && (
          <TabsContent value="matrix" className="space-y-4 ">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Monthly Payment Tracker Matrix</h3>
                <p className="text-xs text-muted-foreground">Click any cell to record or edit member payment.</p>
              </div>
              <Button size="sm" onClick={handleOpenAddMember} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </div>

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
          </TabsContent>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {!isSolo && (
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">Committee Members</h3>
                <p className="text-xs text-muted-foreground">Manage participants and assign payout months.</p>
              </div>
              <Button size="sm" onClick={handleOpenAddMember} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Phone / WhatsApp</TableHead>
                      <TableHead>Assigned Payout Month</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="font-semibold text-foreground">{member.name}</TableCell>
                          <TableCell className="text-muted-foreground">{member.email || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{member.phone || "—"}</TableCell>
                          <TableCell>
                            {member.payoutMonthAssigned ? (
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                Month {member.payoutMonthAssigned}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Unassigned (Draw)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditMember(member)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-500 hover:text-orange-600"
                              title="Remove all payment records"
                              onClick={() => handleBulkDeleteMemberPayments(member)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">Payouts & Draw History</h3>
                <p className="text-xs text-muted-foreground">Track which member received payout for each month.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: committee.totalDurationMonths }).map((_, idx) => {
                const mNum = idx + 1
                const payout = payouts.find((p) => p.monthNumber === mNum)

                return (
                  <Card key={mNum} className={`border transition-all ${payout ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Month {mNum}</Badge>
                        {payout && <Badge className="bg-amber-500 text-slate-950 font-bold">PAID OUT</Badge>}
                      </div>
                      <CardTitle className="text-lg font-bold mt-1">
                        {payout ? payout.recipientName : "No Winner Declared Yet"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {payout ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Net Received:</span>
                            <span className="font-bold text-foreground">{committee.currency} {payout.netPayoutAmount.toLocaleString()}</span>
                          </div>
                          {payout.commissionBidded ? (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                              <span>Commission Discount:</span>
                              <span>{committee.currency} {payout.commissionBidded.toLocaleString()}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between text-muted-foreground">
                            <span>Date:</span>
                            <span>{payout.payoutDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 text-xs"
                            onClick={() => handleOpenLuckyDraw(mNum)}
                          >
                            <Gift className="h-4 w-4" /> Spin Lucky Draw
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOpenRecordPayout(mNum)}
                          >
                            Record Custom Payout / Bid
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

      {/* MODALS */}
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
    </div>
  )
}
