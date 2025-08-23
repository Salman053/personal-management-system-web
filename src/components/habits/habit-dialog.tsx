"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/contexts/auth-context";
import { habitsService } from "@/services/habits";
import { Loader2 } from "lucide-react";
import type { Habit } from "@/types";
import { CustomSelect } from "../shared/custom-select";
import TimeInput from "../ui/time-input";
import { TopicCombobox } from "../shared/quotes-topic-combobox";

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSave: () => void;
}

export function HabitDialog({
  open,
  onOpenChange,
  habit,
  onSave,
}: HabitDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Align with Habit interface
  const [formData, setFormData] = useState<Habit>({
    id: "",
    userId: user?.uid || "",
    color: "",
    motivationQuote:"",
    priority: "Medium",
    title: "",
    description: "",
    type: "Maintain",

    frequency: {
      type: "Daily",
      timesPerPeriod: 1,
      daysOfWeek: [],
    },

    streak: {
      current: 0,
      longest: 0,
      lastCompleted: null,
    },

    stats: {
      totalCompletions: 0,
      missedDays: 0,
      completionRate: 0,
    },

    completedDates: [],

    reminder: {
      enabled: false,
      timeOfDay: "",
      days: [],
    },

    logs: [],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  });

  useEffect(() => {
    if (habit) {
      setFormData(habit);
    } else {
      setFormData((prev) => ({
        ...prev,
        id: "",
        userId: user?.uid || "",
        title: "",
        color: "",
        priority: "Medium",
        motivationQuotes: [],

        description: "",
        type: "Maintain",
        frequency: { type: "Daily", timesPerPeriod: 1, daysOfWeek: [] },
        reminder: { enabled: false, timeOfDay: "" },
      }));
    }
  }, [habit, open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const habitData: Habit = {
        ...formData,
      };

      if (habit) {
        await habitsService.updateHabit(habit.id, habitData);
      } else {
        await habitsService.createHabit(habitData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Habit, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
          <DialogDescription>
            {habit
              ? "Update your habit details."
              : "Add a new habit to track your routines and build lasting change."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              placeholder="e.g., Exercise 30 min"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3 ">
            {/* Type */}
            <div className="space-y-2">
              <Label>Habit Type</Label>
              <CustomSelect
                value={formData.type}
                options={["Maintain", "Quit"]}
                onChange={(v) => handleChange("type", v as Habit["type"])}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <CustomSelect
                options={["Daily", "Weekly", "Monthly", "Custom"]}
                value={formData.frequency.type}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: {
                      ...prev.frequency,
                      type: v as Habit["frequency"]["type"],
                    },
                  }))
                }
              />
            </div>

            {/* Times per period */}
            <div className="space-y-2">
              <Label>Times per {formData.frequency.type}</Label>
              <Input
                type="number"
                value={formData.frequency.timesPerPeriod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: {
                      ...prev.frequency,
                      timesPerPeriod: Number(e.target.value),
                    },
                  }))
                }
                min={1}
              />
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <Label>Reminder</Label>
              <div className="flex gap-2 items-center w-full">
                <Input
                  type="checkbox"
                  className="w-5 h-5 rounded-4xl"
                  checked={formData.reminder?.enabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reminder: {
                        ...prev.reminder,
                        enabled: e.target.checked,
                        timeOfDay: prev?.reminder?.timeOfDay ?? "",
                        days: prev?.reminder?.days ?? [],
                      },
                    }))
                  }
                />
                <TimeInput
                  value={formData.reminder?.timeOfDay || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reminder: {
                        ...prev.reminder,
                        enabled: prev?.reminder?.enabled ?? false,
                        timeOfDay: e.target.value,
                        days: prev?.reminder?.days ?? [],
                      },
                    }))
                  }
                  disabled={!formData.reminder?.enabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Quotes</Label>
              <TopicCombobox
                value={formData.motivationQuote}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    motivationQuote: value,
                  }))
                }
              />
            </div>
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Why is this habit important?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {habit ? "Update Habit" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
