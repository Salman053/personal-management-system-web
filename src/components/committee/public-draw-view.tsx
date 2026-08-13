"use client"

import React, { useState, useEffect } from "react"
import { Committee, CommitteeMember, CommitteePayment, CommitteePayout } from "@/types/committee"
import { getCommitteePublicData, listenCommitteePublicData, PublicCommitteeData } from "@/services/committee"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Trophy, Gift, Check, Clock, ShieldCheck, Sparkles, Search, Copy, CheckCircle2, RefreshCw } from "lucide-react"
import { CommitteeLiveDrawSection } from "@/components/committee/committee-live-draw-section"

interface PublicDrawViewProps {
  initialCommitteeId?: string
}

export function PublicDrawView({ initialCommitteeId }: PublicDrawViewProps) {
  const [searchId, setSearchId] = useState(initialCommitteeId || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PublicCommitteeData | null>(null)
  const [live, setLive] = useState(false)

  const fetchPublicData = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await getCommitteePublicData(id.trim())
      if (result) {
        setData(result)
        setLive(true)
      } else {
        setError("Committee record not found. Please check the Committee ID.")
        setData(null)
        setLive(false)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load committee details.")
    } finally {
      setLoading(false)
    }
  }

  // Live subscription: winners wall, matrix, and overview all update in
  // realtime when the admin records payments / declares winners.
  useEffect(() => {
    if (!live || !data?.committee?.id) return
    const unsub = listenCommitteePublicData(data.committee.id, (updated) => {
      setData(updated)
    })
    return unsub
  }, [live, data?.committee?.id])

  useEffect(() => {
    if (initialCommitteeId) {
      fetchPublicData(initialCommitteeId)
    }
  }, [initialCommitteeId])



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPublicData(searchId)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="mx-auto space-y-8">
        {/* Public Header Banner */}
        <div className="text-center space-y-3">
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Public Committee Verification Portal
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-200 to-purple-300">
            Committee Transparency Tracker
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            No login required! Enter your Committee ID below to track monthly payments, total funds collected, and draw winners transparently.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex items-center gap-2 pt-2">
            <Input
              placeholder="Enter Committee ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-slate-900 mt-0 border-slate-700 text-white placeholder:text-slate-500 h-11"
            />
            <Button type="submit" disabled={loading} className="h-11 bg-indigo-600 hover:bg-indigo-700 font-bold px-5">
              {loading ? "Loading..." : <><Search className="h-4 w-4 mr-1.5" /> Search</>}
            </Button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-center text-sm">
            {error}
          </div>
        )}

        {/* Loaded Committee View */}
        {data && (
          <div className="space-y-6">
            {/* Overview Card */}
            <Card className="bg-slate-900/90 border-slate-800 text-white shadow-2xl">
              <CardHeader className="border-b border-slate-800">
                <div className="flex  items-center justify-between gap-3">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-2">
                    ACTIVE COMMITTEE
                  </Badge>
                  <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white inline-flex items-center gap-3">
                    {data.committee.name}
                    {live && (
                      <Badge className="bg-emerald-600 text-white gap-1 ml-2 align-middle">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  {data.committee.description && (
                    <CardDescription className="text-slate-400 mt-1">
                      {data.committee.description}
                    </CardDescription>
                  )}

                  <div className="text-right p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                    <span className="text-xs text-indigo-300 block">Monthly Contribution</span>
                    <span className="text-2xl font-black text-amber-400">
                      {data.committee.currency} {data.committee.monthlyContribution.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      Total Pool: {data.committee.currency} {(data.committee.monthlyContribution * data.committee.totalDurationMonths).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Members</span>
                  <span className="text-xl font-bold text-white">{data.members.length}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Duration</span>
                  <span className="text-xl font-bold text-white">{data.committee.totalDurationMonths} Months</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Draw Mechanism</span>
                  <span className="text-xl font-bold text-amber-400">
                    {data.committee.drawMechanism === "bidding" ? "Bidding" : "Lucky Draw"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Completed Payouts</span>
                  <span className="text-xl font-bold text-emerald-400">{data.payouts.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* LIVE LUCKY DRAW - realtime across browsers */}
            <CommitteeLiveDrawSection
              committeeId={data.committee.id}
              committeeName={data.committee.name}
            />

            {/* Payout Winners Wall of Fame */}
            <Card className="bg-slate-900/90 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-300">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Monthly Payout Winners Wall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: data.committee.totalDurationMonths }).map((_, idx) => {
                    const mNum = idx + 1
                    const payout = data.payouts.find((p) => p.monthNumber === mNum)

                    return (
                      <div
                        key={mNum}
                        className={`p-3 rounded-xl border transition-all ${payout
                          ? "bg-gradient-to-br from-amber-950/30 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5"
                          : "bg-slate-950/40 border-slate-800"
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Month {mNum} Payout</span>
                          {payout && <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold">WINNER</Badge>}
                        </div>

                        {payout ? (
                          <div className="space-y-1">
                            <span className="text-base font-extrabold text-amber-300 block">
                              👑 {payout.recipientName}
                            </span>
                            <span className="text-xs text-slate-300 font-mono block">
                              Recv: {data.committee.currency} {payout.netPayoutAmount.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic block py-1">Draw Pending</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Public Transparent Member Payment Matrix */}
            <Card className="bg-slate-900/90 border-slate-800 text-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Member Payment Transparency Sheet
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Live verification status for all participants.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader className="bg-slate-950">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-300 font-bold">Member Name</TableHead>
                      {Array.from({ length: data.committee.totalDurationMonths }).map((_, i) => {
                        const currentMonthDate = new Date(data.committee.startMonth);
                        currentMonthDate.setMonth(currentMonthDate.getMonth() + i);
                        const monthLabel = currentMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                        return (
                          <TableHead key={i + 1} className="text-center text-slate-300 font-bold min-w-[100px]">
                            Month {i + 1} ({monthLabel})
                          </TableHead>
                        );
                      })}

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.members.map((member) => (
                      <TableRow key={member.id} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell className="font-semibold text-white">{member.name}</TableCell>
                        {Array.from({ length: data.committee.totalDurationMonths }).map((_, i) => {
                          const mNum = i + 1
                          const payment = data.payments.find((p) => p.memberId === member.id && p.monthNumber === mNum)
                          const isPaid = payment?.status === "paid"

                          return (
                            <TableCell key={mNum} className="text-center p-2 border-l border-slate-800">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                  <Check className="h-3 w-3" /> Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  <Clock className="h-3 w-3" /> Pending
                                </span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
