"use client"

import React, { useState } from "react"
import { useMainContext } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { Committee } from "@/types/committee"
import { createCommittee, updateCommittee, deleteCommittee } from "@/services/committee"
import { CommitteeCard } from "@/components/committee/committee-card"
import { CommitteeDialog } from "@/components/committee/committee-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, User, Search, PiggyBank, DollarSign, Award, Calendar } from "lucide-react"

export default function CommitteesPage() {
  const { committees = [], committeeMembers = [], committeePayments = [] } = useMainContext()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "group" | "solo">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null)

  const handleOpenCreate = () => {
    setEditingCommittee(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (committee: Committee) => {
    setEditingCommittee(committee)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this committee plan and all its data?")) return
    try {
      await deleteCommittee(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveCommittee = async (data: Partial<Committee>) => {
    if (!user?.uid) return
    if (editingCommittee) {
      await updateCommittee(editingCommittee.id, data)
    } else {
      await createCommittee({
        userId: user.uid,
        name: data.name || "New Committee",
        description: data.description || "",
        mode: data.mode || "group",
        monthlyContribution: data.monthlyContribution || 10000,
        currency: data.currency || "PKR",
        totalDurationMonths: data.totalDurationMonths || 12,
        startMonth: data.startMonth || new Date().toISOString().substring(0, 7),
        drawMechanism: data.drawMechanism || "lucky_draw",
        gracePeriodDays: data.gracePeriodDays || 5,
        lateFeeAmount: data.lateFeeAmount || 0,
        status: "active",
      })
    }
  }

  // Filter committees
  const filteredCommittees = committees.filter((c: Committee) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === "all" ? true : c.mode === activeTab
    return matchesSearch && matchesTab
  })

  // Summary Metrics
  const totalGroupCommittees = committees.filter((c: Committee) => c.mode === "group").length
  const totalSoloSavings = committees.filter((c: Committee) => c.mode === "solo").length
  const totalMonthlyVolume = committees.reduce((sum: number, c: Committee) => sum + (c.monthlyContribution || 0), 0)

  return (
    <div className="  space-y-8 ">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Committee & Savings Systems
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage group rotating savings (ROSCA / Chit Fund) or set up virtual disciplined solo savings plans.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 bg-primary hover:bg-primary/90 h-11 px-5 shadow-md w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Create New Committee / Savings
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 via-card to-card border-indigo-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Group Committees</span>
              <span className="text-2xl font-black text-foreground">{totalGroupCommittees} Active</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Solo Savings Plans</span>
              <span className="text-2xl font-black text-foreground">{totalSoloSavings} Active</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <User className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Total Monthly Pool Volume</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                PKR {totalMonthlyVolume.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search committees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all">All Plans ({committees.length})</TabsTrigger>
            <TabsTrigger value="group">Group ({totalGroupCommittees})</TabsTrigger>
            <TabsTrigger value="solo">Solo ({totalSoloSavings})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Committee Grid */}
      {filteredCommittees.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/50 space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <PiggyBank className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No Committees Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first rotating group committee or solo self-savings plan to start tracking monthly payments.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Committee
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommittees.map((committee: Committee) => {
            const membersCount = committeeMembers.filter((m: any) => m.committeeId === committee.id).length
            return (
              <CommitteeCard
                key={committee.id}
                committee={committee}
                memberCount={membersCount}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <CommitteeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        committee={editingCommittee}
        onSave={handleSaveCommittee}
      />
    </div>
  )
}
