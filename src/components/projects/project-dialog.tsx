"use client";;
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { projectsService } from "@/services/projects";
import { Loader2 } from "lucide-react";
import DateInput from "../ui/date-input";
import { toast } from "sonner";
import { Project } from "@/types";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: () => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    type: "personal" as "client" | "personal",
    status: "active" as "active" | "completed" | "paused",
    startDate: "",
    endDate: "",
    totalAmount: "",
    advanceAmount: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        clientName: project?.clientName || "",
        clientAddress: project?.clientAddress || "",
        clientPhone: project?.clientPhone || "",
        clientEmail: project?.clientEmail || "",
        description: project.description || "",
        type: project.type,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate ? project.endDate : "",
        totalAmount: project.totalAmount?.toString() || "",
        advanceAmount: project.advanceAmount?.toString() || "",
      });
    } else {
      setFormData({
        title: "",
        clientAddress: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        description: "",
        type: "personal",
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        totalAmount: "",
        advanceAmount: "",
      });
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (formData.type === "client" && formData.clientPhone.length < 11 ) {
      toast.error("Please enter a valid phone number")
      return;
    }
    setLoading(true);
    try {
      const projectData: Project = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate || "",
        clientAddress: formData.clientAddress || "",
        clientName: formData.clientName || "",
        clientPhone: formData.clientPhone || "",
        clientEmail: formData.clientEmail || "",
        endDate: formData.endDate || "",
        totalAmount: formData.totalAmount
          ? Number.parseFloat(formData.totalAmount)
          : 0,
        advanceAmount: formData.advanceAmount
          ? Number.parseFloat(formData.advanceAmount)
          : 0,
      };

      // console.log(projectData);
      if (project) {
        await projectsService
          .updateProject(project.docId as string, projectData)
          .then(() => {
            toast("Project is successfully updated");
          })
          .catch((e) => {
            toast.error(`Updating Error : ${e.message}`);
          });
      } else {
        await projectsService
          .createProject(user.uid, {
            ...projectData,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any)
          .then(() => {
            toast("Project is successfully created");
          })
          .catch((e) => {
            toast.error(`creation Error : ${e.message}`);
          });
      }
      onSave();
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {project
              ? "Update your project details."
              : "Add a new project to track your work and progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Project Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === "client" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 ">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Client Name"
                  // className="w-fit"
                  required
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                />
              </div>
              <div className="space-y-2 ">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  // className="w-fit"
                  required
                  placeholder="Client Phone"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange("clientPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2 ">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  // className="w-fit"
                  required
                  placeholder="Client Phone"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) =>
                    handleChange("clientAddress", e.target.value)
                  }
                  placeholder="Describe your client address"
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className=" space-y-2 w-full ">
              <Label htmlFor="startDate">Start Date</Label>
              <DateInput
                id={"startDate"}
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2 ">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <DateInput
                id="endDate"
                // className="w-fit"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your project"
              rows={3}
            />
          </div>

          {formData.type === "client" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (Rs)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="1"
                  min={0}
                  value={formData.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advanceAmount">Paid Amount (Rs)</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  step="1"
                  min={0}
                  value={formData.advanceAmount}
                  onChange={(e) =>
                    handleChange("advanceAmount", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

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
              {project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
