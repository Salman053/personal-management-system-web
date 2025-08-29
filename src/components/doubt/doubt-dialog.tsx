"use client";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Doubt, DoubtPriority, DoubtStatus } from "@/types/index";
import DateInput from "@/components/ui/date-input";
import { doubtService } from "@/services/doubt";
import { useAuth } from "@/contexts/auth-context";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  details: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"] as const),
  status: z.enum(["open", "in_review", "resolved"] as const),
  tags: z.string().optional(),
  reviewBy: z.string().nullable().optional(),
  resolutionExplanation: z.string().optional(),
  sources: z.string().optional(),
});

export type DoubtFormValues = z.infer<typeof schema> & {
  id?: string;
  userId: string;
};

export type DoubtDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDoubt: (Doubt & { userId: string }) | null;
  onSave: () => void; // now async
  onCancel?: () => void;
};

export default function DoubtDialog({
  open,
  onOpenChange,
  editingDoubt,
  onSave,
  onCancel,
}: DoubtDialogProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }, // ✅ fixed
  } = useForm<DoubtFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      details: "",
      category: "General",
      priority: "Low",
      status: "open",
      tags: "",
      reviewBy: null,
      resolutionExplanation: "",
      sources: "",
      userId: user?.uid,
    },
  });

  // ✅ reset when editing or new
  useEffect(() => {
    if (editingDoubt) {
      reset({
        id: editingDoubt.id,
        userId: editingDoubt.userId,
        title: editingDoubt.title,
        details: editingDoubt.details ?? "",
        category: editingDoubt.category ?? "General",
        priority: editingDoubt.priority,
        status: editingDoubt.status,
        tags: Array.isArray(editingDoubt?.tags)
          ? editingDoubt.tags.join(", ")
          : editingDoubt?.tags || "",

        sources: Array.isArray(editingDoubt?.sources)
          ? editingDoubt.sources.join(", ")
          : editingDoubt?.sources || "",

        reviewBy: editingDoubt.reviewBy ?? null,
        resolutionExplanation: editingDoubt?.resolutionExplanation ?? "",
      });
    } else {
      reset();
    }
  }, [editingDoubt, reset]);

  const isResolved = watch("status") === "resolved";

  // ✅ async handler
  const onSubmit = async (values: DoubtFormValues) => {
    try {
      if (!values.title) {
        toast.warning("Please enter a title/question");
        return;
      }
      if (editingDoubt) {
        await doubtService
          .updateDoubt(editingDoubt.id, {
            ...values,
            userId: user?.uid,
            tags: values.tags
              ? values.tags.split(",").map((t) => t.trim())
              : [],
            sources: values.sources
              ? values.sources.split(",").map((s) => s.trim())
              : [],
          } as Doubt)
          .then(() => {
            reset();
            toast.success("Doubt updated successfully");
          });
      } else {
        await doubtService
          .createDoubt({
            ...values,
            userId: user?.uid,
            tags: values.tags
              ? values.tags.split(",").map((t) => t.trim())
              : [],
            sources: values.sources
              ? values.sources.split(",").map((s) => s.trim())
              : [],
          } as Doubt)
          .then(() => {
            reset();
            toast.success("Doubt created successfully");
          });
      }
      onSave(); // wait for Firestore
      reset();
      onOpenChange(false); // close dialog
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to save doubt");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
        reset();
      }}
    >
      <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-auto">
        <DialogHeader className="p-0">
          <DialogTitle>
            {editingDoubt ? "Edit Doubt" : "Create New Doubt"}
          </DialogTitle>
          <DialogDescription>
            {editingDoubt
              ? "Update your doubt, add resolution info, or change status."
              : "Log a new doubt so you can research and resolve it later."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title / Question</Label>
            <Input
              required
              id="title"
              placeholder="e.g. Why use useCallback?"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <span role="alert" className="text-sm text-destructive">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="grid gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              placeholder="Describe the context, what you tried, error messages, etc."
              rows={3}
              {...register("details")}
            />
          </div>

          {/* Row: Category + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                onValueChange={(v) =>
                  ((
                    document.getElementById(
                      "category_hidden"
                    ) as HTMLInputElement
                  ).value = v)
                }
                defaultValue={editingDoubt?.category ?? "General"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Next.js">Next.js</SelectItem>
                  <SelectItem value="Firebase">Firebase</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                </SelectContent>
              </Select>
              <input
                id="category_hidden"
                type="hidden"
                {...register("category")}
              />
              {errors.category && (
                <span role="alert" className="text-sm text-destructive">
                  {errors.category.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                onValueChange={(v) =>
                  ((
                    document.getElementById(
                      "priority_hidden"
                    ) as HTMLInputElement
                  ).value = v)
                }
                defaultValue={editingDoubt?.priority ?? "Low"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <input
                id="priority_hidden"
                type="hidden"
                {...register("priority")}
              />
            </div>
          </div>

          {/* Row: Status + Review By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                onValueChange={(v) =>
                  ((
                    document.getElementById("status_hidden") as HTMLInputElement
                  ).value = v)
                }
                defaultValue={editingDoubt?.status ?? "open"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <input id="status_hidden" type="hidden" {...register("status")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reviewBy">Review By (optional)</Label>
              <DateInput
                id="reviewBy"
                name="reviewBy"
                value={""}
                onChange={(e: any) => {
                  const val = document.getElementById(
                    "reviewBy_hidden"
                  ) as HTMLInputElement;
                  val.value = e.target.value;
                }}
              />
              <input
                id="reviewBy_hidden"
                type="hidden"
                {...register("reviewBy")}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="hooks, rendering, optimization"
              {...register("tags")}
            />
          </div>

          {/* Resolution block */}
          <div className="grid gap-3 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label>Mark as Resolved</Label>
                <span className="text-sm text-muted-foreground">
                  Add explanation and sources if resolved
                </span>
              </div>
              <Switch
                checked={isResolved}
                onCheckedChange={(checked) => {
                  const input = document.getElementById(
                    "status_hidden"
                  ) as HTMLInputElement;
                  input.value = checked ? "resolved" : "open";
                }}
                aria-label="Toggle resolved"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resolutionExplanation">
                Resolution Explanation
              </Label>
              <Textarea
                id="resolutionExplanation"
                placeholder="Write what solved it, trade-offs, gotchas..."
                rows={3}
                {...register("resolutionExplanation")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sources">Sources (comma separated URLs)</Label>
              <Textarea
                id="sources"
                rows={2}
                placeholder="https://docs..., https://video..., note#123"
                {...register("sources")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingDoubt ? "Update Doubt" : "Create Doubt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
