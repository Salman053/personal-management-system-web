"use client"

import React, { useState, useEffect } from "react"
import { CommitteeMember } from "@/types/committee"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Trophy, Shuffle, CheckCircle2, RotateCw } from "lucide-react"

interface LuckyDrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthNumber: number
  currency: string
  totalPoolAmount: number
  eligibleMembers: CommitteeMember[]
  onSelectWinner: (member: CommitteeMember) => Promise<void>
}

export function LuckyDrawModal({
  open,
  onOpenChange,
  monthNumber,
  currency,
  totalPoolAmount,
  eligibleMembers,
  onSelectWinner,
}: LuckyDrawModalProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentDisplayMember, setCurrentDisplayMember] = useState<CommitteeMember | null>(null)
  const [winner, setWinner] = useState<CommitteeMember | null>(null)
  const [isSavingWinner, setIsSavingWinner] = useState(false)

  useEffect(() => {
    if (open) {
      setWinner(null)
      setIsSpinning(false)
      if (eligibleMembers.length > 0) {
        setCurrentDisplayMember(eligibleMembers[0])
      } else {
        setCurrentDisplayMember(null)
      }
    }
  }, [open, eligibleMembers])

  const handleStartDraw = () => {
    if (eligibleMembers.length === 0 || isSpinning) return

    setIsSpinning(true)
    setWinner(null)

    // Rapid shuffle animation for 3.5 seconds
    let counter = 0
    const totalSteps = 35
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length)
      setCurrentDisplayMember(eligibleMembers[randomIndex])
      counter++

      if (counter >= totalSteps) {
        clearInterval(interval)
        // Pick actual final winner
        const finalWinnerIndex = Math.floor(Math.random() * eligibleMembers.length)
        const finalWinner = eligibleMembers[finalWinnerIndex]
        setCurrentDisplayMember(finalWinner)
        setWinner(finalWinner)
        setIsSpinning(false)
      }
    }, 100)
  }

  const handleConfirmWinner = async () => {
    if (!winner) return
    setIsSavingWinner(true)
    try {
      await onSelectWinner(winner)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingWinner(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-indigo-500/30 overflow-hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 ring-4 ring-amber-500/30 text-amber-400 mb-2">
            <Trophy className="h-6 w-6 animate-bounce" />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            Month {monthNumber} Lucky Draw!
          </DialogTitle>
          <DialogDescription className="text-indigo-200/80">
            Prize Pool: <span className="font-bold text-amber-300">{currency} {totalPoolAmount.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center space-y-6">
          {/* Animated Winner / Carousel Container */}
          <div className="w-full relative px-4">
            <div className={`p-8 rounded-2xl border-2 text-center transition-all duration-300 relative overflow-hidden ${
              winner
                ? "border-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse"
                : isSpinning
                ? "border-indigo-400 bg-indigo-900/50 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                : "border-indigo-500/30 bg-indigo-950/40"
            }`}>
              {/* Background ambient particle styling */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-indigo-500/10 to-purple-500/5 pointer-events-none" />

              <span className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-2 block">
                {winner ? "🎉 WINNER DECLARED 🎉" : isSpinning ? "SPINNING WHEEL OF FORTUNE..." : "READY TO DRAW"}
              </span>

              {eligibleMembers.length === 0 ? (
                <p className="text-amber-300 font-medium py-4">All members have received payouts!</p>
              ) : (
                <div className="min-h-[70px] flex flex-col items-center justify-center">
                  <h3 className={`text-3xl font-black transition-all ${
                    winner ? "text-amber-300 scale-110" : "text-white"
                  }`}>
                    {currentDisplayMember?.name || "???"}
                  </h3>
                  {currentDisplayMember?.phone && (
                    <span className="text-xs text-indigo-300 mt-1 font-mono">{currentDisplayMember.phone}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Participant count badge */}
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Badge variant="outline" className="border-indigo-400/40 text-indigo-200 bg-indigo-900/30">
              {eligibleMembers.length} Eligible Candidates Remaining
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 w-full px-4">
            {!winner ? (
              <Button
                onClick={handleStartDraw}
                disabled={isSpinning || eligibleMembers.length === 0}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all gap-2"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="h-5 w-5 animate-spin" />
                    Spinning...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-5 w-5" />
                    Draw Month {monthNumber} Winner!
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleStartDraw}
                  disabled={isSavingWinner}
                  className="flex-1 border-indigo-400/40 text-indigo-200 hover:bg-indigo-900/40"
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Spin Again
                </Button>
                <Button
                  onClick={handleConfirmWinner}
                  disabled={isSavingWinner}
                  className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSavingWinner ? "Assigning..." : "Confirm Winner"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
