// ================================================
// File: components/doubts/DoubtList.tsx
// ================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Doubt } from "@/types";
import { doubtService } from "@/services/doubt";
import DoubtDialog from "./doubt-dialog";
import DoubtRow from "./doubt-row";
import { ResolveDoubtDialog } from "./reolve-dailog";
import { DoubtView } from "./view-doubt";
import ConfirmDialog from "../system/confirm-dialog";
import { useMainContext } from "@/contexts/app-context";
import { useModalState } from "@/hooks/use-modal-state";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// ------------------------------------------------
// Doubt List Component
// ------------------------------------------------
export default function DoubtList() {
  const { doubts } = useMainContext();

  // --- State ---
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);
  const [selectedDoubtId, setSelectedDoubtId] = useState<string>("");
  const [filteredDoubts, setFilteredDoubts] = useState<Doubt[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const { modalState, closeModal, openModal, toggleModal } = useModalState({
    createEditOpen: false,
    deleteOpen: false,
    resolveOpen: false,
    viewOpen: false,
  });

  // --- Sync doubts from context ---
  useEffect(() => {
    setFilteredDoubts(doubts ?? []);
  }, [doubts]);

  const total = doubts.length;
  const open = doubts.filter((d) => d.status === "open").length;
  const inReview = doubts.filter((d) => d.status === "in_review").length;
  const resolved = doubts.filter((d) => d.status === "resolved").length;

  const priorityCount = {
    Critical: doubts.filter((d) => d.priority === "Critical").length,
    High: doubts.filter((d) => d.priority === "High").length,
    Medium: doubts.filter((d) => d.priority === "Medium").length,
    Low: doubts.filter((d) => d.priority === "Low").length,
  };

  // --- Filter doubts ---
  const visibleDoubts = useMemo(() => {
    return filteredDoubts.filter((doubt) => {
      const matchesText =
        !search ||
        doubt.title.toLowerCase().includes(search.toLowerCase()) ||
        (doubt.details ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "all" || doubt.status === status;
      const matchesCategory = category === "all" || doubt.category === category;

      return matchesText && matchesStatus && matchesCategory;
    });
  }, [filteredDoubts, search, status, category]);

  // --- Delete Doubt ---
  const handleDelete = async () => {
    try {
      await doubtService.deleteDoubt(selectedDoubtId);
      toast.success("Doubt deleted");
      setSelectedDoubtId("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  };

  // ------------------------------------------------
  // Render
  // ------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Dashboard Cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{open}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{inReview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{resolved}</p>
          </CardContent>
        </Card>
      </section>

      {/* Priority Distribution */}
      {/* <section>
        <h2 className="text-lg font-semibold mb-3">Priority Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(priorityCount).map(([priority, count]) => (
            <Card key={priority}>
              <CardHeader>
                <CardTitle>{priority}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Search doubts..."
            value={search}
            className="w-full"
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="React">React</SelectItem>
              <SelectItem value="Next.js">Next.js</SelectItem>
              <SelectItem value="Firebase">Firebase</SelectItem>
              <SelectItem value="Algorithms">Algorithms</SelectItem>
              <SelectItem value="UI/UX">UI/UX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingDoubt(null);
            toggleModal("createEditOpen");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Doubt
        </Button>
      </div>

      {/* Doubt List */}
      <div className="grid md:grid-cols-3  gap-4">
        {visibleDoubts.map((doubt) => (
          <DoubtRow
            key={doubt.id}
            doubt={doubt}
            onEdit={() => {
              setEditingDoubt(doubt);
              openModal("createEditOpen");
            }}
            onDelete={(id: string) => {
              setSelectedDoubtId(id);
              openModal("deleteOpen");
            }}
            onResolve={() => {
              setEditingDoubt(doubt);
              openModal("resolveOpen");
            }}
            onView={() => {
              setEditingDoubt(doubt);
              openModal("viewOpen");
            }}
          />
        ))}

        {visibleDoubts.length === 0 && (
          <div className="rounded-2xl md:col-span-3 border p-6 text-center text-muted-foreground">
            No doubts found. Add your first one!
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <DoubtDialog
        open={modalState.createEditOpen}
        onOpenChange={() => {
          closeModal("createEditOpen");
          setEditingDoubt(null);
        }}
        editingDoubt={editingDoubt}
        onSave={() => {
          setEditingDoubt(null);
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={modalState.deleteOpen}
        lockWhilePending
        onOpenChange={() => closeModal("deleteOpen")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => {
          setSelectedDoubtId("");
          closeModal("deleteOpen");
          setEditingDoubt(null);
        }}
      />

      {/* Resolve Dialog */}
      <ResolveDoubtDialog
        doubt={editingDoubt as any}
        open={modalState.resolveOpen}
        currentResolution={editingDoubt?.resolutionExplanation}
        onOpenChange={() => {
          closeModal("resolveOpen");
          setEditingDoubt(null);
        }}
      />

      {/* View Dialog */}
      <DoubtView
        doubt={editingDoubt as any}
        open={modalState.viewOpen}
        onOpenChange={() => {
          closeModal("viewOpen");
          setEditingDoubt(null);
        }}
        onResolve={setEditingDoubt}
      />
    </div>
  );
}
