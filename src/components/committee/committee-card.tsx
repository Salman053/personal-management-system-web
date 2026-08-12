"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Committee } from "@/types/committee"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, User, Calendar, DollarSign, Award, Copy, Check, ExternalLink, Trash2, Edit3 } from "lucide-react"
import ProgressBar from "../shared/progress-bar"

interface CommitteeCardProps {
  committee: Committee
  memberCount: number
  paidThisMonthCount?: number
  onEdit?: (committee: Committee) => void
  onDelete?: (id: string) => void
}

export function CommitteeCard({
  committee,
  memberCount,
  paidThisMonthCount = 0,
  onEdit,
  onDelete,
}: CommitteeCardProps) {
  const [copied, setCopied] = useState(false)

  const isSolo = committee.mode === "solo"
  const totalPool = (committee.monthlyContribution * committee.totalDurationMonths).toLocaleString()
  const monthlyAmount = committee.monthlyContribution.toLocaleString()

  const copyPublicLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/committee-portal?id=${committee.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border/60 bg-card/80 backdrop-blur-sm relative overflow-hidden group">
      {/* Top indicator bar */}
      <ProgressBar />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={isSolo ? "outline" : "default"} className={isSolo ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-indigo-600 text-white"}>
                {isSolo ? <User className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                {isSolo ? "Solo Savings" : "Group Committee"}
              </Badge>
              <Badge variant={committee.status === "active" ? "secondary" : "outline"}>
                {committee.status.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {committee.name}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(committee)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(committee.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {committee.description && (
          <p className="text-muted-foreground line-clamp-2">{committee.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40">
          <div>
            <span className="text-xs text-muted-foreground block">Monthly Contribution</span>
            <span className="font-semibold text-foreground text-base">
              {committee.currency} {monthlyAmount}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Total Lump Sum</span>
            <span className="font-semibold text-primary text-base">
              {committee.currency} {totalPool}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Duration: {committee.totalDurationMonths} Months</span>
          </div>
          {!isSolo && (
            <div className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>Mechanism: {committee.drawMechanism === "bidding" ? "Bidding" : "Lucky Draw"}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyPublicLink}
          className="gap-1.5 text-xs h-8"
          title="Share Public Link (No Login Needed)"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied Link!" : "Share Link"}
        </Button>

        <Link href={`/dashboard/committees/${committee.id}`}>
          <Button size="sm" className="gap-1 text-xs h-8 bg-primary hover:bg-primary/90">
            View Details
            <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
