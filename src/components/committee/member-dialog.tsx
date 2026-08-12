"use client"

import React, { useState, useEffect } from "react"
import { CommitteeMember } from "@/types/committee"
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

interface MemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: CommitteeMember | null
  totalDurationMonths: number
  onSave: (data: Partial<CommitteeMember>) => Promise<void>
}

export function MemberDialog({
  open,
  onOpenChange,
  member,
  totalDurationMonths,
  onSave,
}: MemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [payoutMonthAssigned, setPayoutMonthAssigned] = useState<string>("")

  useEffect(() => {
    if (member) {
      setName(member.name || "")
      setEmail(member.email || "")
      setPhone(member.phone || "")
      setPayoutMonthAssigned(member.payoutMonthAssigned ? String(member.payoutMonthAssigned) : "")
    } else {
      setName("")
      setEmail("")
      setPhone("")
      setPayoutMonthAssigned("")
    }
  }, [member, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        payoutMonthAssigned: payoutMonthAssigned ? Number(payoutMonthAssigned) : undefined,
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
          <DialogTitle>{member ? "Edit Member Details" : "Add Committee Member"}</DialogTitle>
          <DialogDescription>
            Add participant information for payment tracking and email reminders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="memberName">Member Name</Label>
            <Input
              id="memberName"
              placeholder="e.g. Ali Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="memberEmail">Email Address (For Reminders)</Label>
            <Input
              id="memberEmail"
              type="email"
              placeholder="ali@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="memberPhone">Phone / WhatsApp</Label>
            <Input
              id="memberPhone"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="payoutMonth">Assigned Payout Month (Optional)</Label>
            <select
              id="payoutMonth"
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={payoutMonthAssigned}
              onChange={(e) => setPayoutMonthAssigned(e.target.value)}
            >
              <option value="">-- Not Assigned Yet (Use Lucky Draw / Bidding) --</option>
              {Array.from({ length: totalDurationMonths }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Month {idx + 1} Payout
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
