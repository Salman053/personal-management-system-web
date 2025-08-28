"use client";
import type React from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { projectsService } from "@/services/projects";
import { Loader2 } from "lucide-react";
import { predefinedContacts, Project, ProjectPayment } from "@/types";
import { toast } from "sonner";
import DateInput from "../ui/date-input";
import { useMainContext } from "@/contexts/app-context";
import { CustomSelect } from "../shared/custom-select";
import { sendNotification } from "@/lib/sending-notification";

const MEDIUMS = ["Cash", "Easypaisa", "Bank", "Cheque", "Other"];

interface ProjectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: ProjectPayment | null;
  onSave: () => void;
  project: Project;
}

export function ProjectPaymentDialog({
  open,
  onOpenChange,
  project,
  payment,
  onSave,
}: ProjectPaymentDialogProps) {
  const { projectPayments } = useMainContext();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProjectPayment>({
    id: "",
    docId: "",
    type: "Income", // Always project payment
    amount: "" as any,
    category: "Project Payment",
    description: "",
    date: "",
    projectId: project?.id as string,
    userId: user?.uid as string,
    medium: "Cash",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        userId: user?.uid as string,
        type: "Income",
        amount: payment.amount.toString() as any,
        category: "Project Payment",
        description: payment.description,
        date: payment.date,
        medium: payment.medium || "Cash",
        projectId: payment.projectId || "",
      });
    } else {
      setFormData({
        type: "Income",
        amount: "" as any,
        category: "Project Payment",
        description: "",
        medium: "Cash",
        userId: user?.uid as string,
        date: new Date().toISOString().split("T")[0],
        projectId: project?.id as string,
      });
    }
  }, [payment, open, user, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation → ensure payment doesn’t exceed project total
    const totalPaid =
      projectPayments
        ?.filter((t: ProjectPayment) => t.projectId === project?.id)
        .reduce((sum: any, t: ProjectPayment) => sum + Number(t.amount), 0) +
      project.advanceAmount;

    if (Number(formData.amount) + totalPaid > Number(project?.totalAmount)) {
      toast.error("Payment exceeds project total.");
      return;
    }

    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }
    if (!formData.projectId) {
      toast.error("Project not found for payment.");
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast.error("Make payment greater than 0 ");
      return;
    }

    setLoading(true);
    try {
      const paymentData: ProjectPayment = {
        type: "Income",
        amount: Number(formData.amount),
        category: "Project Payment",
        description: formData.description,
        date: formData.date,
        projectId: formData.projectId,
        medium: formData.medium,
        userId: user.uid,
      };
      if (payment) {
        await projectsService
          .updateProjectPayment(payment.id as string, paymentData)
          .then(() => {
            // sendNotification({
            //   contacts: [
            //     {
            //       email: predefinedContacts[0].email,
            //     },
            //   ],
            //   message: `Dear client Mr . ${project.clientName} have successfully paid Rs. ${formData.amount} at Dated : ${formData.date} for Project : ${project.title} \n You Paid Rs. ${totalPaid} out of ${project.totalAmount}  `,
            //   type: "email",
            //   title: `Payment Confirmation of ${project.title} status project status : ${project.status}.`,
            //   note: `This is confirmation that you have successfully paid this above amount of your project please make sure to complete the whole payment ${project.endDate ? `before the due date of project which is ${project.endDate}` : "as soon as possible thank you best regards from Fusion Team"} `,
            // }).then(() => {
            //   toast.success(
            //     `Confirmation Email sent to email ${predefinedContacts[0].email}`
            //   );
            // });
            toast.success(
              `${payment.amount} is updated to ${formData.amount} successfully`
            );
          })
          .catch((e) => {
            toast.error(e.message);
          });
      } else {
        await projectsService
          .createProjectPayment(user.uid, paymentData)
          .then(() => {
            sendNotification({
              contacts: [
                {
                  email: predefinedContacts[0].email,
                },
              ],
              message: `Dear client Mr . ${project.clientName} have successfully paid Rs. ${formData.amount} at Dated : ${formData.date} for Project : ${project.title} \n You Paid Rs. ${totalPaid} out of ${project.totalAmount}  `,
              type: "email",
              title: `Payment Confirmation of ${project.title} status project status : ${project.status}.`,
              note: `This is confirmation that you have successfully paid this above amount of your project please make sure to complete the whole payment ${project.endDate ? `before the due date of project which is ${project.endDate}` : "as soon as possible thank you best regards from Fusion Team"} `,
            }).then(() => {
              toast.success(
                `Confirmation Email sent to email ${predefinedContacts[0].email}`
              );
            });
            toast.success(`${formData.amount} is added successfully`);
          })
          .catch((e) => {
            toast.error(e.message);
          });
      }

      onSave();
    } catch (error) {
      toast.error("Error saving payment. Try again later.");
      console.error("Error saving payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {payment ? "Edit Project Payment" : "Add Project Payment"}
          </DialogTitle>
          <DialogDescription>
            {payment
              ? "Update payment details."
              : "Record a new payment for this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rs)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                min={0}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <CustomSelect
                options={MEDIUMS}
                value={formData.medium}
                onChange={(value) => handleChange("medium", value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DateInput
              id="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter payment description"
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
              {payment ? "Update Payment" : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
