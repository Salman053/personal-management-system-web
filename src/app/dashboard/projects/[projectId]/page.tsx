"use client";
import { useState, useEffect, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useMainContext } from "@/contexts/app-context";
import PaymentStatusCard from "@/components/projects/project-payment-card";
import TaskBoard from "@/components/task/task-board";
import { useAuth } from "@/contexts/auth-context";
import { Project, ProjectPayment } from "@/types";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { useModalState } from "@/hooks/use-modal-state";
import { useParams, useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import { ProjectPaymentDialog } from "@/components/payment/project-payment-dialog";
import { sendNotification } from "@/lib/sending-notification";
import { formatDate } from "@/lib/date-utility";
import { CooldownButton } from "@/components/system/useCoolDownButton";

// // Types
// interface Task {
//   id: string;
//   title: string;
//   description: string;
//   status: "active" | "completed" | "paused" | "review";
//   dueDate: Date;
//   assignedTo: string;
//   projectId: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export default function ProjectManagementScreen() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    projects,
    projectPayments,
  }: { projects: Project[]; projectPayments: ProjectPayment[] } =
    useMainContext();
  const [project, setProject] = useState<Project | any>({});
  const [payments, setPayments] = useState<ProjectPayment[] | any>({});

  // 
  const { modalState, toggleModal } = useModalState({
    isEditDialogOpen: false,
    isLoading: false,
    isPaymentDialogOpen: false,
  });
  // Filter tasks based on search and status

  // 

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };
  

  // const paymentProgress =
  //   projects.totalAmount && projects.paidAmount !== undefined
  //     ? (projects.paidAmount / projects.totalAmount) * 100
  //     : 0;

  useEffect(() => {
    if (projects && params.projectId) {
      const foundProject = projects.find(
        (p: Project) => p.docId === params.projectId
      );
      setProject(foundProject || {});
    }
  }, [projects, params.projectId]);

  useEffect(() => {
    if (project?.id) {
      setPayments(
        projectPayments.filter(
          (p: ProjectPayment) => p.projectId === project.id
        )
      );
    }
  }, [project, projectPayments]);

  const makePaymentList: any = () => {
    if (!payments.length) return ["No payments yet."];
    return payments.map(
      (p: ProjectPayment) =>
        `${p.description} — Rs. ${p.amount} (${p.medium}) dated: ${new Date(
          p.date
        ).toDateString()}`
    );
  };

  const calculatePayments = useCallback(() => {
    return (
      payments.reduce(
        (sum: number, p: ProjectPayment) => Number(p.amount) + sum,
        0
      ) + Number(project.advanceAmount)
    );
  }, [payments, project.advanceAmount]);

  const sendEmail = async () => {
    const totalPaid = calculatePayments();
    const totalRemaining = project?.totalAmount - totalPaid;

    await sendNotification({
      type: "email",
      contacts: [{ email: project.clientEmail }],
      subject: `Project Payments Reminder`,
      title: "Payment",

      message: `Project ${project.title} is ${project.status} \n These are payments history. You have paid: Rs. ${totalPaid}, and remaining is: Rs. ${totalRemaining}.`,
      list: [
        ...makePaymentList(),
        `${project.clientName} - Rs. ${project.advanceAmount} dated: ${formatDate(
          project.createdAt
        )}`,
      ],
      note: "Make the remaining payment as soon as possible thank you best regards from Fusion Team",
    });
  };

  return (
    <div className="min-h-screen bg-background ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h1>
          <Button onClick={() => toggleModal("isEditDialogOpen")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <CooldownButton
            label="Send Email"
            cooldownMs={3600000} // 1 hour
            storageKey="emailCooldown"
            onClick={sendEmail}
          />
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {project.type === "client" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Project Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium">{project.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{project.clientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right">{project.clientAddress}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{project.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{project.endDate ? project.endDate : "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.type === "client" && (
            <PaymentStatusCard
              projectPayments={
                projectPayments.filter(
                  (p: ProjectPayment) => p.projectId === project.id
                ) || []
              }
              onHistoryClick={() =>
                router.push(`/dashboard/projects/${project.id}/history`)
              }
              onAddPaymentClick={() => toggleModal("isPaymentDialogOpen")}
              paymentData={project}
            />
          )}
        </div>

        {/* Project Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              Description: {project.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>

        {/* Task Management */}
        <TaskBoard
          projectId={project.id as string}
          userId={user?.uid as string}
        />
      </div>
      <ProjectDialog
        onOpenChange={() => toggleModal("isEditDialogOpen")}
        onSave={() => toggleModal("isEditDialogOpen")}
        open={modalState.isEditDialogOpen}
        project={project}
      />
      <ProjectPaymentDialog
        project={project}
        onSave={() => toggleModal("isPaymentDialogOpen")}
        open={modalState.isPaymentDialogOpen}
        onOpenChange={() => toggleModal("isPaymentDialogOpen")}
      />
    </div>
  );
}
