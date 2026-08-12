"use client"

import React, { useState, useEffect } from "react"
import { CommitteePayment, PaymentStatus, PaymentMethod } from "@/types/committee"
import { Trash2 } from "lucide-react"
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
import DateInput from "../ui/date-input"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  monthNumber: number
  expectedAmount: number
  currency: string
  existingPayment?: CommitteePayment | null
  onSave: (data: {
    status: PaymentStatus
    amountPaid: number
    paymentDate: string
    paymentMethod: PaymentMethod
    notes?: string
    penaltyApplied?: number
  }) => Promise<void>
  onDelete?: () => Promise<void>
}

export function PaymentDialog({
  open,
  onOpenChange,
  memberName,
  monthNumber,
  expectedAmount,
  currency,
  existingPayment,
  onSave,
  onDelete,
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [status, setStatus] = useState<PaymentStatus>("paid")
  const [amountPaid, setAmountPaid] = useState<string>(String(expectedAmount))
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer")
  const [notes, setNotes] = useState("")
  const [penaltyApplied, setPenaltyApplied] = useState("0")

  useEffect(() => {
    if (existingPayment) {
      setStatus(existingPayment.status)
      setAmountPaid(String(existingPayment.amountPaid ?? expectedAmount))
      setPaymentDate(existingPayment.paymentDate || new Date().toISOString().substring(0, 10))
      setPaymentMethod(existingPayment.paymentMethod || "bank_transfer")
      setNotes(existingPayment.notes || "")
      setPenaltyApplied(String(existingPayment.penaltyApplied || 0))
    } else {
      setStatus("paid")
      setAmountPaid(String(expectedAmount))
      setPaymentDate(new Date().toISOString().substring(0, 10))
      setPaymentMethod("bank_transfer")
      setNotes("")
      setPenaltyApplied("0")
    }
  }, [existingPayment, open, expectedAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        status,
        amountPaid: Number(amountPaid) || 0,
        paymentDate,
        paymentMethod,
        notes: notes.trim(),
        penaltyApplied: Number(penaltyApplied) || 0,
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
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Payment for <span className="font-semibold text-foreground">{memberName}</span> — Month {monthNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="status">Payment Status</Label>
              <select
                id="status"
                className="w-full mt-2 h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="late">Late (Overdue)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amountPaid">Amount ({currency})</Label>
              <Input
                id="amountPaid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="paymentDate">Date</Label>
              <DateInput
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="w-full h-10 mt-2 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {status === "late" && (
            <div>
              <Label htmlFor="penalty" className="text-destructive font-medium">
                Penalty / Late Fee ({currency})
              </Label>
              <Input
                id="penalty"
                type="number"
                min="0"
                value={penaltyApplied}
                onChange={(e) => setPenaltyApplied(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="paymentNotes">Notes (Reference #, Transaction ID...)</Label>
            <Textarea
              id="paymentNotes"
              placeholder="e.g. Txn #1234567 via JazzCash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
            {existingPayment && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto gap-1.5"
                disabled={deleting || loading}
                onClick={async () => {
                  setDeleting(true)
                  try {
                    await onDelete()
                    onOpenChange(false)
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setDeleting(false)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Removing..." : "Remove Payment"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || deleting}>
              {loading ? "Saving..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
