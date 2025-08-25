"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { learningService } from "@/services/learning";
import { LearningDialog } from "@/components/learning/learning-dialog";
import { LearningTree } from "@/components/learning/learning-tree";
import { LearningProgress } from "@/components/learning/learning-progress";
import { TemplateDialog } from "@/components/learning/template-dialog";
import {
  Plus,
  Search,
  BookOpen,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";
import { LearningItem } from "@/types";
import { useModalState } from "@/hooks/use-modal-state";
import { useMainContext } from "@/contexts/app-context";
import { CustomSelect } from "@/components/shared/custom-select";
import { toast } from "sonner";
import ConfirmDialog from "@/components/system/confirm-dialog";

export default function LearningPage() {
  const { learning, loading } = useMainContext();
  // const { state, dispatch } = useApp()
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "roadmap" | "topic" | "subtopic" | "note"
  >("all");
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);
  const [selectedParent, setSelectedParent] = useState<LearningItem | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState("");
  const [activeTab, setActiveTab] = useState("roadmaps");

  // console.log(learning);

  const { modalState, toggleModal } = useModalState({
    isDeleteModalOpen: false,
    isDialogModalOpen: false,
  });

  const handleCreateItem = (
    type: "roadmap" | "topic" | "subtopic" | "note",
    parent?: LearningItem
  ) => {
    setEditingItem(null);
    setSelectedParent(parent || null);
    toggleModal("isDialogModalOpen");
  };

  const handleEditItem = (item: LearningItem) => {
    setEditingItem(item);
    setSelectedParent(null);
    toggleModal("isDialogModalOpen");
  };

  const handleDeleteItem = async () => {
    try {
      await learningService
        .deleteLearningItem(user?.uid as string, deletingItem)
        .then(() => {
          toast.success("The Item is deleted successfully and also it's sub ");
          toggleModal("isDeleteModalOpen");
        });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingItem("")
    }
  };

  const handleItemSaved = async () => {
    toggleModal("isDialogModalOpen");
    setEditingItem(null);
    setSelectedParent(null);
  };

  const handleToggleCompletion = async (itemId: string, completed: boolean) => {
    try {
      await learningService.updateLearningItem(itemId, { completed });
    } catch (error) {
      console.error("Error updating completion:", error);
    }
  };

  const handleUpdateProgress = async (itemId: string, progress: number) => {
    try {
      await learningService.updateLearningItem(itemId, { progress });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleTemplateSelected = async () => {
    setIsTemplateDialogOpen(false);
    // await loadLearningItems()
  };

  // // Filter learning items
  const filteredItems = learning.filter((item: any) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // // Get root items (roadmaps)
  const roadmaps = filteredItems.filter(
    (item: LearningItem) => item.type === "roadmap"
  );

  // // Calculate stats
  const stats = {
    totalItems: learning.length,
    roadmaps: learning.filter((item: LearningItem) => item.type === "roadmap")
      .length,
    completedItems: learning.filter((item: LearningItem) => item.completed)
      .length,
    averageProgress:
      learning.length > 0
        ? Math.round(
            learning.reduce(
              (sum: number, item: LearningItem) => sum + Number(item.progress),
              0
            ) / learning.length
          )
        : 0,
  };

  // console.log(  learning.filtere((l: LearningItem) => l.id === "ZwdJJ0exbJdbDCipzjIa "))
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning</h1>
          <p className="text-muted-foreground">
            Organize your learning journey with structured roadmaps
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
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
            <CardTitle className="text-sm font-medium">
              Learning Items
            </CardTitle>
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
            <div className="text-2xl font-bold text-blue-600">
              {stats.roadmaps}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageProgress}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          {/* <TabsTrigger value="topics">Topics</TabsTrigger> */}
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
                  <CustomSelect
                    onChange={(value) => setFilterType(value as any)}
                    options={["all", "roadmap", "topic", "subtopic", "note"]}
                    value={filterType}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Tree */}
          <LearningTree
            loading={loading}
            items={learning}
            onDelete={(id) => {
              setDeletingItem(id);
              toggleModal("isDeleteModalOpen");
            }}
            roadmaps={roadmaps}
            onEdit={handleEditItem}
            onCreateChild={handleCreateItem}
            onToggleCompletion={handleToggleCompletion}
            onUpdateProgress={handleUpdateProgress}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <LearningProgress items={learning} />
        </TabsContent>
      </Tabs>

      {/* Learning Dialog */}
      <LearningDialog
        open={modalState.isDialogModalOpen}
        onOpenChange={() => toggleModal("isDialogModalOpen")}
        item={editingItem as any}
        parent={selectedParent}
        onSave={handleItemSaved}
      />
      <ConfirmDialog
        open={modalState.isDeleteModalOpen}
        onCancel={() => toggleModal("isDeleteModalOpen")}
        onConfirm={handleDeleteItem}
        lockWhilePending
        description="This process is not reversible it delete all data related to this item like , topic , subtopics , notes etc"
        requireText="Delete"
        destructive
      />

      {/* Template Dialog */}
      <TemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onTemplateSelected={handleTemplateSelected}
      />
    </div>
  );
}
