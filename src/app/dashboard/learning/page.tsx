"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { learningService } from "@/services/learning"
import { LearningDialog } from "@/components/learning/learning-dialog"
import { LearningTree } from "@/components/learning/learning-tree"
import { LearningProgress } from "@/components/learning/learning-progress"
import { TemplateDialog } from "@/components/learning/template-dialog"
import { Plus, Search, BookOpen, Target, TrendingUp, Award } from "lucide-react"
import { LearningItem } from "@/types"

export default function LearningPage() {
  const { user } = useAuth()
  // const { state, dispatch } = useApp()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "roadmap" | "topic" | "subtopic" | "note">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null)
  const [selectedParent, setSelectedParent] = useState<LearningItem | null>(null)
  const [activeTab, setActiveTab] = useState("roadmaps")

  // useEffect(() => {
  //   if (user) {
  //     loadLearningItems()
  //   }
  // }, [user])

  // const loadLearningItems = async () => {
  //   if (!user) return

  //   try {
  //     setLoading(true)
  //     const items = await learningService.getLearningItems(user.uid)

  //     // Calculate progress for each item
  //     const itemsWithProgress = items.map((item) => ({
  //       ...item,
  //       progress: learningService.calculateProgress(item, items),
  //     }))

  //     dispatch({ type: "SET_LEARNING", payload: itemsWithProgress })
  //   } catch (error) {
  //     console.error("Error loading learning items:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleCreateItem = (type: "roadmap" | "topic" | "subtopic" | "note", parent?: LearningItem) => {
    setEditingItem(null)
    setSelectedParent(parent || null)
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: LearningItem) => {
    setEditingItem(item)
    setSelectedParent(null)
    setIsDialogOpen(true)
  }

  // const handleDeleteItem = async (itemId: string) => {
  //   if (!confirm("Are you sure you want to delete this item? This will also delete all child items.")) return

  //   try {
  //     await learningService.deleteLearningItem(itemId)
  //     await loadLearningItems()
  //   } catch (error) {
  //     console.error("Error deleting learning item:", error)
  //   }
  // }

  // const handleItemSaved = async () => {
  //   setIsDialogOpen(false)
  //   setEditingItem(null)
  //   setSelectedParent(null)
  //   await loadLearningItems()
  // }

  // const handleToggleCompletion = async (itemId: string, completed: boolean) => {
  //   try {
  //     await learningService.updateLearningItem(itemId, { completed })
  //     await loadLearningItems()
  //   } catch (error) {
  //     console.error("Error updating completion:", error)
  //   }
  // }

  // const handleUpdateProgress = async (itemId: string, progress: number) => {
  //   try {
  //     await learningService.updateLearningItem(itemId, { progress })
  //     await loadLearningItems()
  //   } catch (error) {
  //     console.error("Error updating progress:", error)
  //   }
  // }

  // const handleTemplateSelected = async () => {
  //   setIsTemplateDialogOpen(false)
  //   await loadLearningItems()
  // }

  // // Filter learning items
  // const filteredItems = state.learning.filter((item) => {
  //   const matchesSearch =
  //     item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.description.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesType = filterType === "all" || item.type === filterType
  //   return matchesSearch && matchesType
  // })

  // // Get root items (roadmaps)
  // const roadmaps = filteredItems.filter((item) => item.type === "roadmap")

  // // Calculate stats
  // const stats = {
  //   totalItems: state.learning.length,
  //   roadmaps: state.learning.filter((item) => item.type === "roadmap").length,
  //   completedItems: state.learning.filter((item) => item.completed).length,
  //   averageProgress:
  //     state.learning.length > 0
  //       ? Math.round(state.learning.reduce((sum, item) => sum + item.progress, 0) / state.learning.length)
  //       : 0,
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning</h1>
          <p className="text-muted-foreground">Organize your learning journey with structured roadmaps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Use Template
          </Button>
          <Button onClick={() => handleCreateItem("roadmap")}>
            <Plus className="mr-2 h-4 w-4" />
            New Roadmap
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Items</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roadmaps</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.roadmaps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
          <TabsTrigger value="progress">Progress Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmaps" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search learning items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="roadmap">Roadmaps</option>
                    <option value="topic">Topics</option>
                    <option value="subtopic">Subtopics</option>
                    <option value="note">Notes</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Tree */}
          {/* <LearningTree
            items={state.learning}
            roadmaps={roadmaps}
            loading={loading}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onCreateChild={handleCreateItem}
            onToggleCompletion={handleToggleCompletion}
            onUpdateProgress={handleUpdateProgress}
          /> */}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <LearningProgress items={state.learning} />
        </TabsContent>
      </Tabs>

      {/* Learning Dialog */}
      <LearningDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        parent={selectedParent}
        // onSave={handleItemSaved}
      />

      {/* Template Dialog */}
      <TemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        // onTemplateSelected={handleTemplateSelected}
      />
    </div>
  )
}
