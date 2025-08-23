"use client";

import { useMainContext } from "@/contexts/app-context";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentTimelineChart from "@/components/payment/PaymentTimeChart";
import { Project, ProjectPayment } from "@/types";
import { ProjectPaymentDialog } from "@/components/payment/project-payment-dialog";
import { useModalState } from "@/hooks/use-modal-state";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { PaymentTable } from "@/components/payment/payment-table";
import { projectsService } from "@/services/projects";
import { toast } from "sonner";
import ConfirmDialog from "@/components/system/confirm-dialog";

export default function PaymentHistory() {
  const { projectPayments, projects, loading } = useMainContext();
  const [project, setProject] = useState<Project | any>({});
  const [selectedPayment, setSelectedPayment] = useState<ProjectPayment | null>(
    null
  );
  // const [payments,]
  const { modalState, toggleModal } = useModalState({
    isPaymentDialogOpen: false,
    isDeletionDialogOpen: false,
  });
  const params = useParams();

  // Filter project-specific payments
  const projectTxns = projectPayments?.filter(
    (t: ProjectPayment) => t.projectId === params.projectId
  );

  useEffect(() => {
    if (projects) {
      setProject(
        projects.find((p: Project) => p.id === (params.projectId as string))
      );
    } else {
      setProject({});
    }
  }, [projects]);

  const handlePaymentDelete = async () => {
    try {
      projectsService
        .deleteProjectPayment(selectedPayment?.id as string)
        .then(() => {
          toast.error(`Payment of ${selectedPayment?.amount}`);
          toggleModal("isDeletionDialogOpen");
        });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex item-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Payment History for {project?.title}
        </h2>
        <Button onClick={() => toggleModal("isPaymentDialogOpen")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>
      {/* Chart */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Timeline Overview</CardTitle>
        </CardHeader>
        <CardContent className="pr-7 pl-0">
          <PaymentTimelineChart payments={projectTxns} />
        </CardContent>
      </Card>

      {/* Payment List */}
      {/* <PaymentList payments={projectTxns} /> */}
      <PaymentTable
        loading={loading}
        onDelete={(payment) => {
          toggleModal("isDeletionDialogOpen");
          setSelectedPayment(payment);
        }}
        onEdit={(payment) => {
          toggleModal("isPaymentDialogOpen");
          setSelectedPayment(payment);
        }}
        payments={projectTxns}
      />
      <ProjectPaymentDialog
        project={project}
        payment={selectedPayment}
        onSave={() => {toggleModal("isPaymentDialogOpen");setSelectedPayment(null)}}
        open={modalState.isPaymentDialogOpen}
        onOpenChange={() => toggleModal("isPaymentDialogOpen")}
      />
      <ConfirmDialog
        requireText="Delete"
        open={modalState.isDeletionDialogOpen}
        onCancel={() => toggleModal("isDeletionDialogOpen")}
        destructive
        lockWhilePending
        onConfirm={handlePaymentDelete}
      />
    </div>
  );
}
