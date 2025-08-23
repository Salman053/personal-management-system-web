"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { learningService } from "@/services/learning"
import type { LearningItem } from "@/contexts/app-context"
import { Loader2, Plus, X } from "lucide-react"

interface LearningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LearningItem | null
  parent?: LearningItem | null
  onSave: () => void
}

export function LearningDialog({ open, onOpenChange, item, parent, onSave }: LearningDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "roadmap" as "roadmap" | "topic" | "subtopic" | "note",
    progress: 0,
    completed: false,
    resources: [] as string[],
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        type: item.type,
        progress: item.progress,
        completed: item.completed,
        resources: item.resources || [],
      })
    } else {
      const defaultType = parent ? getChildType(parent.type) : "roadmap"
      setFormData({
        title: "",
        description: "",
        type: defaultType,
        progress: 0,
        completed: false,
        resources: [],
      })
    }
  }, [item, parent, open])

  const getChildType = (parentType: string): "topic" | "subtopic" | "note" => {
    switch (parentType) {
      case "roadmap":
        return "topic"
      case "topic":
        return "subtopic"
      case "subtopic":
        return "note"
      default:
        return "note"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const learningData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        parentId: parent?.id,
        progress: formData.progress,
        completed: formData.completed,
        resources: formData.resources,
      }

      if (item) {
        await learningService.updateLearningItem(item.id, learningData)
      } else {
        await learningService.createLearningItem(user.uid, {
          ...learningData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any)
      }

      onSave()
    } catch (error) {
      console.error("Error saving learning item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, ""],
    }))
  }

  const updateResource = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, i) => (i === index ? value : resource)),
    }))
  }

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }))
  }

  const getTypeLabel = () => {
    switch (formData.type) {
      case "roadmap":
        return "Roadmap"
      case "topic":
        return "Topic"
      case "subtopic":
        return "Subtopic"
      case "note":
        return "Note"
      default:
        return "Item"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? `Edit ${getTypeLabel()}` : `Create New ${getTypeLabel()}`}
            {parent && <span className="text-sm text-muted-foreground ml-2">under "{parent.title}"</span>}
          </DialogTitle>
          <DialogDescription>
            {item
              ? `Update your ${getTypeLabel().toLowerCase()} details.`
              : `Add a new ${getTypeLabel().toLowerCase()} to organize your learning.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{getTypeLabel()} Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={`Enter ${getTypeLabel().toLowerCase()} title`}
                required
              />
            </div>

            {!parent && (
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="topic">Topic</SelectItem>
                    <SelectItem value="subtopic">Subtopic</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={`Describe your ${getTypeLabel().toLowerCase()}...`}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleChange("progress", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completed">Status</Label>
              <Select
                value={formData.completed ? "completed" : "in-progress"}
                onValueChange={(value) => handleChange("completed", value === "completed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resources (Links, Documents, etc.)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResource}>
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </Button>
            </div>
            <div className="space-y-2">
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={resource}
                    onChange={(e) => updateResource(index, e.target.value)}
                    placeholder="Enter URL or resource description"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeResource(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? `Update ${getTypeLabel()}` : `Create ${getTypeLabel()}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
