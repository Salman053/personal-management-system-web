"use client"

import React, { useState, useEffect } from "react"
import { Committee, CommitteeMode, CommitteeDrawMechanism } from "@/types/committee"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, User, HelpCircle } from "lucide-react"
import DateInput from "../ui/date-input"
import { cn } from "@/lib/utils"

interface CommitteeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committee?: Committee | null
  onSave: (data: Partial<Committee>) => Promise<void>
}

export function CommitteeDialog({
  open,
  onOpenChange,
  committee,
  onSave,
}: CommitteeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<CommitteeMode>("group")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [monthlyContribution, setMonthlyContribution] = useState("10000")
  const [currency, setCurrency] = useState("PKR")
  const [totalDurationMonths, setTotalDurationMonths] = useState("12")
  const [startMonth, setStartMonth] = useState(() => new Date().toISOString().substring(0, 7))
  const [drawMechanism, setDrawMechanism] = useState<CommitteeDrawMechanism>("lucky_draw")
  const [gracePeriodDays, setGracePeriodDays] = useState("5")
  const [lateFeeAmount, setLateFeeAmount] = useState("0")

  useEffect(() => {
    if (committee) {
      setMode(committee.mode || "group")
      setName(committee.name || "")
      setDescription(committee.description || "")
      setMonthlyContribution(String(committee.monthlyContribution || 10000))
      setCurrency(committee.currency || "PKR")
      setTotalDurationMonths(String(committee.totalDurationMonths || 12))
      setStartMonth(committee.startMonth || new Date().toISOString().substring(0, 7))
      setDrawMechanism(committee.drawMechanism || "lucky_draw")
      setGracePeriodDays(String(committee.gracePeriodDays ?? 5))
      setLateFeeAmount(String(committee.lateFeeAmount ?? 0))
    } else {
      setMode("group")
      setName("")
      setDescription("")
      setMonthlyContribution("10000")
      setCurrency("PKR")
      setTotalDurationMonths("12")
      setStartMonth(new Date().toISOString().substring(0, 7))
      setDrawMechanism("lucky_draw")
      setGracePeriodDays("5")
      setLateFeeAmount("0")
    }
  }, [committee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        mode,
        monthlyContribution: Number(monthlyContribution) || 0,
        currency: currency.trim() || "PKR",
        totalDurationMonths: Number(totalDurationMonths) || 12,
        startMonth,
        drawMechanism: mode === "solo" ? "lucky_draw" : drawMechanism,
        gracePeriodDays: Number(gracePeriodDays) || 0,
        lateFeeAmount: Number(lateFeeAmount) || 0,
        status: committee ? committee.status : "active",
      })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const durationNum = Number(totalDurationMonths) || 12
  const contributionNum = Number(monthlyContribution) || 0
  const totalLumpSum = durationNum * contributionNum

  return (
    <Dialog open={open} >
      <DialogContent className="min-w-[70%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {committee ? "Edit Committee / Savings Plan" : "Create New Committee / Savings Plan"}
          </DialogTitle>
          <DialogDescription>
            Configure group rotating savings (Committee / Chit Fund / ROSCA) or solo savings mode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">System Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("group")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 text-left transition-all ${mode === "group"
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm font-semibold">Group Committee</span>
                <span className="text-xs text-muted-foreground text-center mt-0.5">
                  Multiple members pool money each month. One gets payout monthly.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("solo")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 text-left transition-all ${mode === "solo"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                  : "border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-sm font-semibold">Solo Savings Plan</span>
                <span className="text-xs text-muted-foreground text-center mt-0.5">
                  Save fixed amount monthly with discipline for a lump sum target.
                </span>
              </button>
            </div>
          </div>

          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Plan / Committee Name</Label>
              <Input
                id="name"
                placeholder={mode === "solo" ? "e.g. Dream Car Savings Fund" : "e.g. Family & Friends Monthly Committee"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description / Notes (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Purpose, rules, payout order preferences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="monthlyContribution">Monthly Amount</Label>
              <Input
                id="monthlyContribution"
                type="number"
                min="1"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="PKR, USD, EUR..."
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalDurationMonths">Duration (Months)</Label>
              <Input
                id="totalDurationMonths"
                type="number"
                min="1"
                max="60"
                value={totalDurationMonths}
                onChange={(e) => setTotalDurationMonths(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Calculated Total Lump Sum:</span>
              <div className="text-lg font-bold text-primary">
                {currency} {totalLumpSum.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-right text-muted-foreground">
              {durationNum} installments of {currency} {contributionNum.toLocaleString()}
            </div>
          </div>

          {/* Dates & Mechanism */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5 w-full">
              <Label htmlFor="startMonth" className="text-sm font-medium text-foreground">
                Start Month
              </Label>
              <DateInput
                id="startMonth"
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                required
              />
            </div>

            {mode === "group" ? (
              <div className="flex flex-col gap-1.5 w-full">
                <Label htmlFor="drawMechanism" className="text-sm font-medium text-foreground">
                  Payout Draw Mechanism
                </Label>
                <select
                  id="drawMechanism"
                  value={drawMechanism}
                  onChange={(e) => setDrawMechanism(e.target.value as CommitteeDrawMechanism)}
                  className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-background dark:bg-input/30 px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow]",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    "cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat pr-10"
                  )}
                >
                  <option value="lucky_draw">Lucky Draw (Random Wheel)</option>
                  <option value="bidding">Bidding (Lowest Payout Wins)</option>
                </select>
              </div>
            ) : (
              /* Hidden placeholder prevents grid collapse when mode !== "group" on desktop layouts */
              <div className="hidden md:block" />
            )}
          </div>

          {/* Late Payment Options */}
          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Late Payment Rules (Optional)</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gracePeriod" className="text-xs text-muted-foreground">
                  Grace Period (Days)
                </Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  min="0"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lateFee" className="text-xs text-muted-foreground">
                  Late Fee ({currency})
                </Label>
                <Input
                  id="lateFee"
                  type="number"
                  min="0"
                  value={lateFeeAmount}
                  onChange={(e) => setLateFeeAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : committee ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
