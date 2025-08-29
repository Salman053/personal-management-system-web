"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your firebase setup
import { toast } from "sonner";
import { Doubt } from "@/types";

interface ResolveDoubtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doubt: Doubt;
  currentResolution?: string;
}

export function ResolveDoubtDialog({
  open,
  onOpenChange,
  doubt,
  currentResolution,
}: ResolveDoubtDialogProps) {
  const [resolution, setResolution] = useState(currentResolution || "");
  const [sources, setSources] = useState(
    Array.isArray(doubt?.sources) ? doubt.sources.join(", ") : ""
  );
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (resolution.length < 3) {
      toast.warning("Please add atleast 3 word in the resolution");
      return;
    }
    setLoading(true);
    try {
      const ref = doc(db, "doubts", doubt.id);

      await updateDoc(ref, {
        isResolved: true,
        resolutionExplanation: resolution,
        sources: sources ? sources.split(",").map((s) => s.trim()) : [],
        resolvedAt: new Date(),
        updatedAt: new Date(),
        status: "resolved",
      });

      toast.success("Doubt Resolution is updated successfully");
      onOpenChange(false);
    } catch (err) {
      console.error("Error resolving doubt:", err);
      toast.error("Failed to resolve doubt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve Doubt of {doubt?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resolution Field */}
          <div className="space-y-3">
            <Label htmlFor="resolution">Resolution Explanation</Label>
            <Textarea
              required
              id="resolution"
              placeholder="Write how you solved this doubt..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Sources Field */}
          <div className="space-y-3">
            <Label htmlFor="sources">Sources (comma separated URLs)</Label>
            <Textarea
              id="sources"
              rows={2}
              placeholder="https://docs..., https://video..., note#123"
              value={sources}
              onChange={(e) => setSources(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={loading}>
            {loading ? "Saving..." : "Resolve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
