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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import DateInput from "../ui/date-input";
import { CustomSelect } from "../shared/custom-select";

import {
  FinanceRecord,
  TransactionType,
  PaymentMedium,
  TransactionCategory,
  TransactionStatus,
} from "@/types/index"; // <- your enums + interface
import { useAuth } from "@/contexts/auth-context";
import { financeServices } from "@/services/transactions";

interface FinanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: FinanceRecord | null;
  onSave: () => void;
}

export function FinanceRecordDialog({
  open,
  onOpenChange,
  record,
  onSave,
}: FinanceDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FinanceRecord>({
    type: TransactionType.Expense,
    amount: "" as any,
    category: TransactionCategory.OtherExpense,
    medium: PaymentMedium.Cash,
    description: "",
    date: new Date().toISOString().split("T")[0],
    userId: user?.uid as string,
  });

  // Load record into form when editing
  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        type: TransactionType.Expense,
        amount: "" as any,
        category: TransactionCategory.OtherExpense,
        medium: PaymentMedium.Cash,
        description: "",
        date: new Date().toISOString().split("T")[0],
        userId: user?.uid as string,
      });
    }
  }, [record, open, user]);

  const handleChange = (field: keyof FinanceRecord, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      if (record?.id) {
        await financeServices
          .updateTransaction(record.id, formData)
          .then(() => toast.success("Record updated successfully"));
      } else {
        await financeServices.createFinanceRecord(formData).then(() => {
          toast.success("Record saved successfully!");
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error saving record. Try again later.");
      console.error("Error saving finance record:", error);
    } finally {
      setLoading(false);
      onSave()
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {record ? "Edit Finance Record" : "Add Finance Record"}
          </DialogTitle>
          <DialogDescription>
            {record
              ? "Update details of this transaction."
              : "Record a new transaction (income, expense, borrowed, lent)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 → Type & Amount */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <CustomSelect
                options={Object.values(TransactionType) as any}
                value={formData.type}
                onChange={(value) =>
                  handleChange("type", value as TransactionType)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number(e.target.value))}
                min={0}
                required
              />
            </div>
          </div>

          {/* Row 2 → Category & Medium */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <CustomSelect
                options={Object.values(TransactionCategory) as any}
                value={formData.category}
                onChange={(value) =>
                  handleChange("category", value as TransactionCategory)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <CustomSelect
                options={Object.values(PaymentMedium) as any}
                value={formData.medium}
                onChange={(value) =>
                  handleChange("medium", value as PaymentMedium)
                }
              />
            </div>
          </div>

          {/* Conditional Fields → Borrowed/Lent only */}
          {(formData.type === TransactionType.Borrowed ||
            formData.type === TransactionType.Lent) && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="counterparty">Counterparty</Label>
                <Input
                  id="counterparty"
                  value={formData.counterparty || ""}
                  onChange={(e) => handleChange("counterparty", e.target.value)}
                  placeholder="Person/Company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <DateInput
                  id="dueDate"
                  value={
                    formData.dueDate
                      ? new Date(formData.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <CustomSelect
                  options={Object.values(TransactionStatus) as any}
                  value={formData.status || TransactionStatus.Pending}
                  onChange={(value) =>
                    handleChange("status", value as TransactionStatus)
                  }
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <DateInput
              id="date"
              value={
                formData.date
                  ? new Date(formData.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter details about this transaction"
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
              {record ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
