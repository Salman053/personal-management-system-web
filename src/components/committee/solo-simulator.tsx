"use client"

import React, { useMemo, useState } from "react"
import { Committee, CommitteePayment } from "@/types/committee"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Circle, Target, Sparkles, TrendingUp, Calendar, ShieldCheck, Trash2, XCircle } from "lucide-react"

interface SoloSimulatorProps {
  committee: Committee
  payments: CommitteePayment[]
  onRecordMonthlyDeposit?: (monthNumber: number) => void | Promise<void>
  onRemoveDeposit?: (payment_id: string, monthNumber: number) => void | Promise<void>
  onRemoveAllDeposits?: () => void | Promise<void>
}

export function SoloSimulator({
  committee,
  payments,
  onRecordMonthlyDeposit,
  onRemoveDeposit,
  onRemoveAllDeposits,
}: SoloSimulatorProps) {
  const [customMonthly, setCustomMonthly] = useState(String(committee.monthlyContribution))
  const [customMonths, setCustomMonths] = useState(String(committee.totalDurationMonths))
  const [pendingMonth, setPendingMonth] = useState<number | null>(null)
  const [clearing, setClearing] = useState(false)

  // Simulator inputs
  const monthly = Number(customMonthly) || committee.monthlyContribution
  const duration = Number(customMonths) || committee.totalDurationMonths
  const totalTargetLumpSum = monthly * duration

  // De-duplicate paid payments by monthNumber.
  // If duplicates exist (legacy data), keep the earliest-created one
  // so the totals match what the timeline grid displays.
  const uniquePaidByMonth = useMemo(() => {
    const map = new Map<number, CommitteePayment>()
    payments
      .filter((p) => p.status === "paid")
      .forEach((p) => {
        const existing = map.get(p.monthNumber)
        if (!existing) {
          map.set(p.monthNumber, p)
          return
        }
        const existingTs = (existing as any).createdAt?.seconds ?? 0
        const currentTs = (p as any).createdAt?.seconds ?? 0
        if (currentTs < existingTs) map.set(p.monthNumber, p)
      })
    return map
  }, [payments])

  const paidMonthsCount = uniquePaidByMonth.size
  const actualSavedAmount = Array.from(uniquePaidByMonth.values()).reduce(
    (sum, p) => sum + (p.amountPaid || 0),
    0,
  )

  // Duplicate detection (for a warning banner)
  const duplicateMonths = useMemo(() => {
    const counts = new Map<number, number>()
    payments
      .filter((p) => p.status === "paid")
      .forEach((p) => counts.set(p.monthNumber, (counts.get(p.monthNumber) || 0) + 1))
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([m]) => m)
      .sort((a, b) => a - b)
  }, [payments])

  const progressPercentage =
    totalTargetLumpSum > 0
      ? Math.min(100, Math.round((actualSavedAmount / totalTargetLumpSum) * 100))
      : 0

  // Guarded handlers
  const handleRecord = async (monthNumber: number) => {
    if (!onRecordMonthlyDeposit) return
    if (pendingMonth !== null) return
    if (uniquePaidByMonth.has(monthNumber)) return
    setPendingMonth(monthNumber)
    try {
      await onRecordMonthlyDeposit(monthNumber)
    } finally {
      setPendingMonth(null)
    }
  }

  const handleRemove = async (paymentId: string, monthNumber: number) => {
    if (!onRemoveDeposit) return
    if (pendingMonth !== null) return
    setPendingMonth(monthNumber)
    try {
      await onRemoveDeposit(paymentId, monthNumber)
    } finally {
      setPendingMonth(null)
    }
  }

  const handleClearAll = async () => {
    if (!onRemoveAllDeposits) return
    if (clearing) return
    setClearing(true)
    try {
      await onRemoveAllDeposits()
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Duplicate warning banner */}
      {duplicateMonths.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Duplicate deposits detected</strong> for month
          {duplicateMonths.length > 1 ? "s " : " "}
          {duplicateMonths.join(", ")}. Totals are de-duplicated below, but you should remove the extra entries from your database.
        </div>
      )}

      {/* Top Banner & Progress */}
      <Card className="bg-gradient-to-br from-emerald-950/40 via-background to-teal-950/30 border-emerald-500/30 shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Badge className="bg-emerald-600 text-white mb-2">Solo Savings discipline</Badge>
              <CardTitle className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <Target className="h-6 w-6 text-emerald-500" />
                Virtual Committee Goal
              </CardTitle>
              <CardDescription>
                Simulate and discipline yourself to deposit monthly into your virtual committee fund.
              </CardDescription>
            </div>

            <div className="text-right p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Target Lump Sum</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {committee.currency} {totalTargetLumpSum.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted-foreground">Current Savings Progress</span>
              <span className="font-bold text-foreground">
                {committee.currency} {actualSavedAmount.toLocaleString()} / {totalTargetLumpSum.toLocaleString()} ({progressPercentage}%)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-sm">
            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-500 p-1.5 rounded-lg bg-emerald-500/10" />
              <div>
                <span className="text-xs text-muted-foreground block">Monthly Installment</span>
                <span className="font-bold text-foreground">
                  {committee.currency} {monthly.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <Calendar className="h-8 w-8 text-teal-500 p-1.5 rounded-lg bg-teal-500/10" />
              <div>
                <span className="text-xs text-muted-foreground block">Duration</span>
                <span className="font-bold text-foreground">{duration} Months</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-500 p-1.5 rounded-lg bg-indigo-500/10" />
              <div>
                <span className="text-xs text-muted-foreground block">Completed Deposits</span>
                <span className="font-bold text-foreground">
                  {paidMonthsCount} of {duration} Months
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Projection Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Interactive Savings Calculator & Simulator
          </CardTitle>
          <CardDescription>Adjust amounts to see future lump sum projections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="simMonthly">Simulate Monthly Contribution ({committee.currency})</Label>
              <Input
                id="simMonthly"
                type="number"
                min="100"
                value={customMonthly}
                onChange={(e) => setCustomMonthly(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="simMonths">Simulate Period (Months)</Label>
              <Input
                id="simMonths"
                type="number"
                min="1"
                max="120"
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month-by-month Milestone Timeline */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Monthly Deposit Milestones</CardTitle>
              <CardDescription>Track each virtual deposit toward your final payout.</CardDescription>
            </div>
            {onRemoveAllDeposits && paidMonthsCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
                onClick={handleClearAll}
                disabled={clearing || pendingMonth !== null}
              >
                <XCircle className="h-3.5 w-3.5" />
                {clearing ? "Clearing..." : `Clear All Deposits (${paidMonthsCount})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: duration }).map((_, idx) => {
              const mNum = idx + 1
              const payment = uniquePaidByMonth.get(mNum)
              const isPaid = !!payment
              const isPending = pendingMonth === mNum
              const isBusy = pendingMonth !== null

              return (
                <div
                  key={mNum}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all ${isPaid ? "border-emerald-500/50 bg-emerald-500/10" : "border-border bg-card"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-sm block">Month {mNum}</span>
                      <span className="text-xs text-muted-foreground">
                        {committee.currency} {monthly.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isPaid && onRemoveDeposit && payment && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove this deposit"
                        onClick={() => handleRemove(payment.id, mNum)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onRecordMonthlyDeposit && (
                      <Button
                        size="sm"
                        variant={isPaid ? "ghost" : "outline"}
                        className="text-xs h-7 px-2"
                        onClick={() => handleRecord(mNum)}
                        disabled={isPaid || isBusy}
                      >
                        {isPending ? "Saving..." : isPaid ? "Paid" : "Record"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}