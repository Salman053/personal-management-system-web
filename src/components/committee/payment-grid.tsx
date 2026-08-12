"use client"

import React from "react"
import { Committee, CommitteeMember, CommitteePayment, CommitteePayout } from "@/types/committee"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, AlertTriangle, Trophy, Gift, Plus, Mail } from "lucide-react"

interface PaymentGridProps {
  committee: Committee
  members: CommitteeMember[]
  payments: CommitteePayment[]
  payouts: CommitteePayout[]
  onCellClick: (member: CommitteeMember, monthNumber: number) => void
  onPayoutClick: (monthNumber: number) => void
  onLuckyDrawClick: (monthNumber: number) => void
  onSendReminderClick?: (member: CommitteeMember, monthNumber: number) => void
}

export function PaymentGrid({
  committee,
  members,
  payments,
  payouts,
  onCellClick,
  onPayoutClick,
  onLuckyDrawClick,
  onSendReminderClick,
}: PaymentGridProps) {
  const monthsCount = committee.totalDurationMonths
  const monthsArray = Array.from({ length: monthsCount }, (_, i) => i + 1)

  // Quick lookup helper: key = `${memberId}_${monthNumber}`
  const paymentMap = new Map<string, CommitteePayment>()
  payments.forEach((p) => {
    paymentMap.set(`${p.memberId}_${p.monthNumber}`, p)
  })

  // Payout lookup helper: key = monthNumber
  const payoutMap = new Map<number, CommitteePayout>()
  payouts.forEach((p) => {
    payoutMap.set(p.monthNumber, p)
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-card overflow-x-auto shadow-sm">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px] font-bold sticky left-0 bg-muted/90 backdrop-blur-sm z-10">
                Member Name
              </TableHead>
              {monthsArray.map((mNum) => {
                // Calculate monthly stats
                const monthPayments = payments.filter((p) => p.monthNumber === mNum)
                const paidCount = monthPayments.filter((p) => p.status === "paid").length
                const totalCollected = monthPayments
                  .filter((p) => p.status === "paid")
                  .reduce((sum, p) => sum + (p.amountPaid || 0), 0)

                return (
                  <TableHead key={mNum} className="text-center min-w-[130px] p-3 border-l border-border/40">
                    <div className="font-bold text-foreground">Month {mNum}</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {committee.currency} {totalCollected.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {paidCount}/{members.length} Paid
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* PAYOUT / WINNER ROW AT TOP */}
            <TableRow className="bg-amber-500/5 dark:bg-amber-950/20 font-medium border-b-2 border-amber-500/30">
              <TableCell className="sticky left-0 bg-amber-100/80 dark:bg-amber-950/80 backdrop-blur-sm z-10 font-bold text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>Payout Winner</span>
                </div>
              </TableCell>

              {monthsArray.map((mNum) => {
                const payout = payoutMap.get(mNum)

                return (
                  <TableCell key={mNum} className="text-center p-2 border-l border-border/40">
                    {payout ? (
                      <div className="space-y-1">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs truncate max-w-[110px] mx-auto block">
                          👑 {payout.recipientName}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground">
                          Recv: {committee.currency} {payout.netPayoutAmount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 gap-1"
                          onClick={() => onLuckyDrawClick(mNum)}
                        >
                          <Gift className="h-3.5 w-3.5 text-amber-500" />
                          Draw Winner
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>

            {/* MEMBERS PAYMENT MATRIX ROWS */}
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={monthsCount + 1} className="text-center py-8 text-muted-foreground">
                  No members added yet. Click &qout;Add Member&qout; to build your committee payment matrix.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="sticky left-0 bg-card backdrop-blur-sm z-10 font-semibold border-r border-border/40">
                    <div>
                      <span className="text-foreground block">{member.name}</span>
                      {member.phone && (
                        <span className="text-xs text-muted-foreground block">{member.phone}</span>
                      )}
                    </div>
                  </TableCell>

                  {monthsArray.map((mNum) => {
                    const payment = paymentMap.get(`${member.id}_${mNum}`)
                    const status = payment ? payment.status : "pending"

                    return (
                      <TableCell
                        key={mNum}
                        className="text-center p-2 border-l border-border/40 cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => onCellClick(member, mNum)}
                      >
                        <div className="flex flex-col items-center justify-center space-y-1">
                          {status === "paid" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 flex items-center gap-1 text-xs px-2 py-0.5">
                              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              Paid
                            </Badge>
                          ) : status === "late" ? (
                            <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 hover:bg-red-500/25 flex items-center gap-1 text-xs px-2 py-0.5">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              Late
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 flex items-center gap-1 text-xs px-2 py-0.5">
                              <Clock className="h-3 w-3 text-amber-500" />
                              Pending
                            </Badge>
                          )}

                          <span className="text-[11px] text-muted-foreground font-mono">
                            {payment ? `${committee.currency} ${payment.amountPaid}` : `${committee.currency} ${committee.monthlyContribution}`}
                          </span>

                          {status !== "paid" && member.email && onSendReminderClick && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onSendReminderClick(member, mNum)
                              }}
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                              title="Send Email Reminder"
                            >
                              <Mail className="h-2.5 w-2.5" />
                              Remind
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
