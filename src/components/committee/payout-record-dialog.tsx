"use client"

import React, { useState, useEffect } from "react"
import { CommitteeMember, CommitteePayout, CommitteeDrawMechanism } from "@/types/committee"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PayoutRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthNumber: number
  expectedTotalPayout: number
  currency: string
  drawMechanism: CommitteeDrawMechanism
  members: CommitteeMember[]
  existingPayout?: CommitteePayout | null
  onSave: (data: {
    recipientId: string
    recipientName: string
    grossAmount: number
    commissionBidded?: number
    netPayoutAmount: number
    payoutDate: string
    notes?: string
  }) => Promise<void>
}

export function PayoutRecordDialog({
  open,
  onOpenChange,
  monthNumber,
  expectedTotalPayout,
  currency,
  drawMechanism,
  members,
  existingPayout,
  onSave,
}: PayoutRecordDialogProps) {
  const [loading, setLoading] = useState(false)
  const [recipientId, setRecipientId] = useState("")
  const [grossAmount, setGrossAmount] = useState<string>(String(expectedTotalPayout))
  const [commissionBidded, setCommissionBidded] = useState<string>("0")
  const [payoutDate, setPayoutDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (existingPayout) {
      setRecipientId(existingPayout.recipientId || "")
      setGrossAmount(String(existingPayout.grossAmount || expectedTotalPayout))
      setCommissionBidded(String(existingPayout.commissionBidded || 0))
      setPayoutDate(existingPayout.payoutDate || new Date().toISOString().substring(0, 10))
      setNotes(existingPayout.notes || "")
    } else {
      setRecipientId(members[0]?.id || "")
      setGrossAmount(String(expectedTotalPayout))
      setCommissionBidded("0")
      setPayoutDate(new Date().toISOString().substring(0, 10))
      setNotes("")
    }
  }, [existingPayout, open, expectedTotalPayout, members])

  const grossNum = Number(grossAmount) || 0
  const commNum = Number(commissionBidded) || 0
  const netPayoutAmount = Math.max(0, grossNum - commNum)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientId) return

    const selectedMember = members.find((m) => m.id === recipientId)
    const recipientName = selectedMember ? selectedMember.name : "Unknown Member"

    setLoading(true)
    try {
      await onSave({
        recipientId,
        recipientName,
        grossAmount: grossNum,
        commissionBidded: commNum,
        netPayoutAmount,
        payoutDate,
        notes: notes.trim(),
      })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payout — Month {monthNumber}</DialogTitle>
          <DialogDescription>
            Declare the member receiving this month&apos;s committee pool amount.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="recipient">Payout Recipient Member</Label>
            <select
              id="recipient"
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.payoutMonthAssigned ? `(Month ${m.payoutMonthAssigned})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="grossAmount">Gross Pool ({currency})</Label>
              <Input
                id="grossAmount"
                type="number"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="payoutDate">Payout Date</Label>
              <Input
                id="payoutDate"
                type="date"
                value={payoutDate}
                onChange={(e) => setPayoutDate(e.target.value)}
                required
              />
            </div>
          </div>

          {drawMechanism === "bidding" && (
            <div>
              <Label htmlFor="commission" className="text-amber-600 dark:text-amber-400 font-medium">
                Bidded Commission / Discount ({currency})
              </Label>
              <Input
                id="commission"
                type="number"
                min="0"
                value={commissionBidded}
                onChange={(e) => setCommissionBidded(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The amount deducted from payout as lowest bid discount.
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm">
            <span className="text-muted-foreground block text-xs">Final Net Payout Received:</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {currency} {netPayoutAmount.toLocaleString()}
            </span>
          </div>

          <div>
            <Label htmlFor="payoutNotes">Payout Notes</Label>
            <Textarea
              id="payoutNotes"
              placeholder="e.g. Winner of Month 3 Lucky Draw / Bidding"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !recipientId}>
              {loading ? "Saving..." : "Record Payout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
