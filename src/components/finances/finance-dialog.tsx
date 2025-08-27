"use client";
import { memo } from "react";
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
  categoryOptions,
} from "@/types/index"; // <- your enums + interface
import { useAuth } from "@/contexts/auth-context";
import { financeServices } from "@/services/transactions";

interface FinanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: FinanceRecord | null;
  onSave: () => void;
  recordType?: TransactionType;
}

function FinanceRecordDialog({
  open,
  onOpenChange,
  record,
  recordType,
  onSave,
}: FinanceDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FinanceRecord>({
    type: recordType || TransactionType.Income,
    amount: "" as any,
    category: "" as any,
    counterpartyDetails: {
      address: "",
      email: "",
      phone: "",
    },
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
        type: recordType || TransactionType.Expense,
        amount: "" as any,
        category: "" as any,
        counterpartyDetails: {
          address: "",
          email: "",
          phone: "",
        },
        medium: PaymentMedium.Cash,
        description: "",
        date: new Date().toISOString().split("T")[0],
        userId: user?.uid as string,
      });
    }
  }, [record, open, user]);

  const handleChange = (field: keyof any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    parentField: string,
    childField: string,
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }
    if (formData.category === ("" as any)) {
      toast.error("Please select any category");
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    // Fixed validation for Borrowed/Lent
    if (formData.type === TransactionType.Lent || formData.type === TransactionType.Borrowed) {
      if (
        !formData.counterpartyDetails?.phone ||
        formData.counterpartyDetails.phone.length < 10 || // Fixed phone validation
        !formData.counterpartyDetails?.email ||
        formData.counterpartyDetails.email === ""
      ) {
        toast.error(
          "Please enter complete counterparty details (phone and email are required)"
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (record?.id) {
        await financeServices
          .updateFinanceRecord(record.id, formData)
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
                required
                options={categoryOptions[formData.type]} // Dynamic categories
                value={formData.category}
                onChange={(value) => handleChange("category", value)}
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
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="counterparty">Counterparty</Label>
                  <Input
                    id="counterparty"
                    value={formData.counterparty || ""}
                    onChange={(e) => handleChange("counterparty", e.target.value)}
                    placeholder="Person/Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.counterpartyDetails?.email || ""}
                    onChange={(e) =>
                      handleNestedChange("counterpartyDetails", "email", e.target.value)
                    }
                    placeholder="counterparty@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    value={formData.counterpartyDetails?.phone || ""}
                    type="tel"
                    onChange={(e) =>
                      handleNestedChange("counterpartyDetails", "phone", e.target.value)
                    }
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.counterpartyDetails?.address || ""}
                    onChange={(e) =>
                      handleNestedChange("counterpartyDetails", "address", e.target.value)
                    }
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                
                <div className="space-y-2">
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
            </div>
          )}

          {/* Transaction Date - Always show */}
          {(formData.type !== TransactionType.Borrowed &&
            formData.type !== TransactionType.Lent) && (
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
          )}

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

export default FinanceRecordDialog;