"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"
import type { Project } from "@/contexts/app-context"
import { projectsService, type ProjectPayment, type ProjectMilestone } from "@/services/projects"

interface ProjectDetailDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  const [payments, setPayments] = useState<ProjectPayment[]>([])
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project && open) {
      loadProjectDetails()
    }
  }, [project, open])

  const loadProjectDetails = async () => {
    if (!project) return

    setLoading(true)
    try {
      const [paymentsData, milestonesData] = await Promise.all([
        projectsService.getProjectPayments(project.id as string),
        projectsService.getProjectMilestones(project.id as string),
      ])
      setPayments(paymentsData)
      setMilestones(milestonesData)
    } catch (error) {
      console.error("Error loading project details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!project) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const paymentProgress =
    project.totalAmount && project.paidAmount !== undefined ? (project.paidAmount / project.totalAmount) * 100 : 0

  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {project.title}
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <Badge variant="outline">{project.type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{project.startDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{project.endDate ? project.endDate.toLocaleDateString() : "Not set"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.type === "client" && project.totalAmount && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">${project.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid Amount:</span>
                      <span className="font-medium">${(project.paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <Progress value={paymentProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">{paymentProgress.toFixed(1)}% paid</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="milestones" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="milestones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Project Milestones</span>
                    <span className="text-xs text-muted-foreground">
                      {completedMilestones} of {milestones.length} completed
                    </span>
                  </CardTitle>
                  {milestones.length > 0 && <Progress value={milestoneProgress} className="h-2" />}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : milestones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No milestones added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1">
                            {milestone.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{milestone.title}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  milestone.status === "completed"
                                    ? "text-green-600 border-green-600"
                                    : milestone.status === "overdue"
                                      ? "text-red-600 border-red-600"
                                      : ""
                                }
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Due: {milestone.dueDate.toLocaleDateString()}</span>
                              {milestone.completedDate && (
                                <span>Completed: {milestone.completedDate.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No payment schedule set up yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">${payment.amount.toLocaleString()}</span>
                              <Badge
                                variant="outline"
                                className={
                                  payment.status === "paid"
                                    ? "text-green-600 border-green-600"
                                    : payment.status === "overdue"
                                      ? "text-red-600 border-red-600"
                                      : ""
                                }
                              >
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{payment.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Due: {payment.dueDate.toLocaleDateString()}</span>
                              {payment.paidDate && <span>Paid: {payment.paidDate.toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
