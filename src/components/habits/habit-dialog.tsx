"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { habitService } from "@/services/habits";
import type {
  Habit,
  HabitCategory,
  HabitType,
  HabitPriority,
  HabitDifficulty,
} from "@/types/index";

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSave: () => void;
}

const HABIT_ICONS = [
  "🏃",
  "📚",
  "🧘",
  "💪",
  "🥗",
  "💧",
  "😴",
  "🎯",
  "���️",
  "🎨",
  "🎵",
  "🌱",
];
const HABIT_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

export function HabitDialog({
  open,
  onOpenChange,
  habit,
  onSave,
}: HabitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState<Partial<Habit>>({
    name: "",
    description: "",
    category: "health",
    type: "build",
    frequency: "daily",
    priority: "medium",
    difficulty: "medium",
    color: HABIT_COLORS[0],
    icon: HABIT_ICONS[0],
    tags: [],
    reminders: [],
    isActive: true,
  });

  useEffect(() => {
    if (habit) {
      setFormData(habit);
      setTags(habit.tags || []);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "health",
        type: "build",
        frequency: "daily",
        priority: "medium",
        difficulty: "medium",
        color: HABIT_COLORS[0],
        icon: HABIT_ICONS[0],
        tags: [],
        reminders: [],
        isActive: true,
      });
      setTags([]);
    }
  }, [habit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    setLoading(true);
    try {
      const habitData: Omit<Habit, "id" | "createdAt" | "updatedAt"> = {
        ...formData,
        tags,
        reminders: formData.reminders || [],
      } as Omit<Habit, "id" | "createdAt" | "updatedAt">;

      if (habit) {
        await habitService.updateHabit(habit.id, habitData as Partial<Habit>);
        toast.success("Habit updated successfully!");
      } else {
        await habitService.createHabit(habitData);
        toast.success("Habit created successfully!");
      }

      onSave();
    } catch (error) {
      console.error("Error saving habit:", error);
      toast.error("Failed to save habit");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {habit ? "Edit Habit" : "Create New Habit"}
          </DialogTitle>
          <DialogDescription>
            {habit
              ? "Update your habit details and preferences."
              : "Define a new habit to track and build lasting change."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Morning Meditation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: HabitCategory) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    <SelectItem value="creativity">Creativity</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Why is this habit important to you?"
                rows={3}
              />
            </div>
          </div>

          {/* Habit Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: HabitType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="build">Build (New Habit)</SelectItem>
                  <SelectItem value="quit">Quit (Stop Habit)</SelectItem>
                  <SelectItem value="maintain">
                    Maintain (Keep Habit)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, frequency: value as any }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: HabitPriority) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: HabitDifficulty) =>
                  setFormData((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (10 XP)</SelectItem>
                  <SelectItem value="medium">Medium (20 XP)</SelectItem>
                  <SelectItem value="hard">Hard (30 XP)</SelectItem>
                  <SelectItem value="expert">Expert (50 XP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Customization */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2">
                  {HABIT_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      className="h-10 w-10 p-0 text-lg"
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_COLORS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className="h-10 w-10 p-0 border-2 bg-transparent"
                      style={{
                        backgroundColor:
                          formData.color === color ? color : "transparent",
                        borderColor: color,
                      }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                    >
                      {formData.color === color && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                onClick={addTag}
                size="icon"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gradient-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {habit ? "Update Habit" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
