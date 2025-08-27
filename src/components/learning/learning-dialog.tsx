"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateInput from "../ui/date-input";
import { Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { learningService } from "@/services/learning";
import { LearningItem } from "@/types";
import { toast } from "sonner";
import z from "zod";
// Complete LearningItem interface

interface LearningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: LearningItem | null;
  parent?: LearningItem | null;
  onSave: () => void;
}

const learningItemSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  type: z.enum(["roadmap", "topic", "subtopic", "note"]),

  parentId: z.string().optional(),

  progress: z.number().min(0).max(100).default(0),
  completed: z.boolean().default(false),

  estimatedTime: z
    .number()
    .min(0, "Estimated time cannot be negative")
    .optional(),
  actualTime: z.number().min(0, "Actual time cannot be negative").optional(),

  priority: z.enum(["low", "medium", "high"]).default("medium"),

  dueDate: z
    .union([z.date(), z.string().datetime().or(z.literal(""))])
    .optional(),

  hasAssessment: z.boolean().default(false),
  score: z.number().min(0).max(100).optional(),

  tags: z.array(z.string().min(1)).optional(),

  resources: z
    .array(
      z.object({
        label: z.string().min(1, "Resource label required"),
        url: z.string().url("Invalid URL"),
      })
    )
    .optional(),
});
// Mock auth context and learning service for demo

export function LearningDialog({
  open,
  onOpenChange,
  item,
  parent,
  onSave,
}: LearningDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<
    Omit<LearningItem, "id" | "createdBy" | "createdAt" | "updatedAt">
  >({
    title: "",
    description: "",
    type: "roadmap",
    progress: 0,
    completed: false,
    resources: [],
    tags: [],
    estimatedTime: 0,
    actualTime: 0,
    userId: user?.uid as string,
    priority: "medium",
    dueDate: "",
    hasAssessment: false,
    score: 0,
    parentId: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        type: item.type,
        parentId: item.parentId,
        userId: user?.uid as string,
        progress: item.progress,
        completed: item.completed,
        resources: item.resources || [],
        tags: item.tags || [],
        estimatedTime: item.estimatedTime || 0,
        actualTime: item.actualTime || 0,
        priority: item.priority || "medium",
        dueDate: item.dueDate && "",
        hasAssessment: item.hasAssessment || false,
        score: item.score || 0,
      });
    } else {
      const defaultType = parent ? getChildType(parent.type) : "roadmap";
      setFormData({
        title: "",
        description: "",
        type: defaultType,
        parentId: parent?.id || "",
        progress: 0,
        completed: false,
        resources: [],
        tags: [],
        estimatedTime: 0,
        actualTime: 0,
        priority: "medium",
        dueDate: "",
        userId: user?.uid as string,
        hasAssessment: false,
        score: 0,
      });
    }

    // Clear errors and success states when dialog opens/closes
  }, [item, parent, open, user]);

  const getChildType = (parentType: string): "topic" | "subtopic" | "note" => {
    switch (parentType) {
      case "roadmap":
        return "topic";
      case "topic":
        return "subtopic";
      case "subtopic":
        return "note";
      default:
        return "note";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Clean inputs before validation
      const cleanedResources = formData.resources.filter(
        (resource) => resource.label.trim() && resource.url.trim()
      );
      const cleanedTags = formData.tags.filter((tag) => tag.trim());

      const learningData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        parentId: parent?.id || formData.parentId,
        resources: cleanedResources,
        tags: cleanedTags,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : "",
      };

      // ✅ Zod validation
      const parsed = learningItemSchema.safeParse(learningData);
      if (!parsed.success) {
        parsed.error?.issues?.forEach((err) => {
          toast.error(err.message); // show error for each invalid field
        });
        return; // stop submission
      }

      // Proceed with valid data
      if (item?.id) {
        await learningService.updateLearningItem(item.id, {
          ...parsed.data,
          updatedAt: new Date(),
        });
      } else {
        await learningService
          .createLearningItem(user.uid, {
            ...parsed.data,
            priority: parsed.data.priority,
            userId: user.uid,
          } as any)
          .then(() => {
            toast.success("Operation is executed successfully");
          });
      }

      setTimeout(() => {
        onSave();
        onOpenChange(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message);

      console.error("Error saving learning item:", error);
    } finally {
      setLoading(false);
      onSave();
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { label: "", url: "" }],
    }));
  };

  const updateResource = (
    index: number,
    value: { label: string; url: string }
  ) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((r, i) => (i === index ? value : r)),
    }));
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const getTypeLabel = () => {
    switch (formData.type) {
      case "roadmap":
        return "Roadmap";
      case "topic":
        return "Topic";
      case "subtopic":
        return "Subtopic";
      case "note":
        return "Note";
      default:
        return "Item";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item ? `Edit ${getTypeLabel()}` : `Create New ${getTypeLabel()}`}
            {parent && <span>{`Under The ${parent.title}`}</span>}
          </DialogTitle>
          <DialogDescription>
            {item
              ? `Update your ${getTypeLabel().toLowerCase()} details.`
              : `Add a new ${getTypeLabel().toLowerCase()} to organize your learning.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title & Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{getTypeLabel()} Title *</Label>
              <Input
                id="title"
                required
                minLength={3}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={`Enter ${getTypeLabel().toLowerCase()} title`}
              />
            </div>

            {!formData.parentId && (
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  required
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              required
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={`Describe your ${getTypeLabel().toLowerCase()}...`}
              rows={3}
            />
          </div>

          {/* Tags & Priority */}
          {formData.type !== "note" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  required
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    handleChange(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="e.g. React, Algorithms, Math"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange("priority", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Time Tracking */}
          {formData.type !== "note" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (weeks)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="0"
                  value={formData.estimatedTime || ""}
                  onChange={(e) =>
                    handleChange("estimatedTime", Number(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualTime">Actual Time (weeks)</Label>
                <Input
                  id="actualTime"
                  type="number"
                  min="0"
                  value={formData.actualTime || ""}
                  onChange={(e) =>
                    handleChange("actualTime", Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          )}

          {/* Due Date */}
          {formData.type !== "note" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <DateInput
                  id="dueDate"
                  value={formData.dueDate as any}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>

              {/* Assessment */}
              <div className="space-y-2 w-full flex justify-center  items-center">
                <Checkbox
                  id="hasAssessment"
                  checked={formData.hasAssessment}
                  className="mt-7"
                  onCheckedChange={(checked) =>
                    handleChange("hasAssessment", checked)
                  }
                />

                <div className="space-y-2 w-full">
                  <Label htmlFor="score">Score (%)</Label>
                  <Input
                    id="score"
                    type="number"
                    className="w-full"
                    min="0"
                    disabled={!formData.hasAssessment}
                    max="100"
                    value={formData.score || ""}
                    onChange={(e) =>
                      handleChange("score", Number(e.target.value) || undefined)
                    }
                    placeholder="Assessment score"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Learning Resources</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResource}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </Button>
            </div>

            <div className="space-y-3">
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={resource.label}
                    onChange={(e) =>
                      updateResource(index, {
                        ...resource,
                        label: e.target.value,
                      })
                    }
                    required
                    min={3}
                    placeholder="Label (e.g., React Documentation)"
                    className="flex-1"
                  />
                  <Input
                    value={resource.url}
                    onChange={(e) =>
                      updateResource(index, {
                        ...resource,
                        url: e.target.value,
                      })
                    }
                    required
                    type="url"
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeResource(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.resources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                No resources added yet. Click "Add Resource" to get started.
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? `Update ${getTypeLabel()}` : `Create ${getTypeLabel()}`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
