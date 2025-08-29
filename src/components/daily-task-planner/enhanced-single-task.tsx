"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Settings,
  Calendar,
  Search,
  Filter,
  MessageCircle,
  Mail,
  Share2,
} from "lucide-react";
import { useMainContext } from "@/contexts/app-context";
import {
  type SubTask,
  type Task,
  type NotificationContact,
  predefinedContacts,
} from "@/types";
import { ActionMenu } from "@/components/ui/action-menu";
import ConfirmDialog from "@/components/system/confirm-dialog";
import { TaskService } from "@/services/daily-task-planner";
import { EnhancedSubTaskDialog } from "./enhanced-sub-task-dialog";
import { NotificationContactsDialog } from "./notification-contacts-dialog";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utility";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { NotificationService } from "@/services/notification-service";

export default function EnhancedSingleTask() {
  const { taskId } = useParams();
  const router = useRouter();
  const { dailyTaskSubTask, dailyTasks } = useMainContext();
  const [selectedFor, setSelectedFor] = useState<string | null>(null);

  // Find the current task
  const currentTask = dailyTasks.find((t: Task) => t.id === taskId) as Task;

  // Dialog states
  const [subTaskDialog, setSubTaskDialog] = useState(false);
  const [contactsDialog, setContactsDialog] = useState(false);
  const [deletingSubTask, setDeletingSubTask] = useState("");
  const [deletingDialogOpen, setDeleteModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<SubTask | null>(null);
  const [notificationContacts, setNotificationContacts] =
    useState<NotificationContact[]>(predefinedContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const handleSave = () => {
    setEditingSubtask(null);
  };

  const handleDelete = async () => {
    try {
      await TaskService.deleteSubtask(deletingSubTask);
      setDeleteModalOpen(false);
      toast.success("Subtask deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Filter subtasks belonging to this task
  const taskSubtasks: SubTask[] = (dailyTaskSubTask || []).filter(
    (s: SubTask) => s.taskId === taskId
  );

  // ✅ Get unique "for" values from subtasks
  const uniqueFors = useMemo(() => {
    const fors = taskSubtasks.map((s: SubTask) => s.for).filter(Boolean);
    return Array.from(new Set(fors));
  }, [taskSubtasks]);

  // ✅ Filter subtasks by selected "for" and sort (pending first, completed last)
  const filteredByFor = useMemo(() => {
    let result = taskSubtasks;
    if (selectedFor) {
      result = result.filter((s) => s.for === selectedFor);
    }
    // Sort: pending first, completed last
    return result.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [taskSubtasks, selectedFor]);

  // Apply search and status filters to the "for" filtered results
  const filteredSubtasks = filteredByFor.filter((subtask) => {
    const matchesSearch =
      subtask.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subtask.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && subtask.isCompleted) ||
      (statusFilter === "pending" && !subtask.isCompleted);

    return matchesSearch && matchesStatus;
  });

  // ✅ Build message for sharing (based on filtered results)
  const buildMessage = () => {
    const header = `📌 *Task*: ${currentTask.title}\n${
      currentTask.description ? `📝 ${currentTask.description}\n` : ""
    }${selectedFor ? `👤 *For*: ${selectedFor}` : ""}`;

    const subtaskLines = filteredByFor
      .map(
        (s, i) =>
          `${i + 1}. ${s.isCompleted ? "✅" : "❌"} ${s.title}${
            s.description ? ` - ${s.description}` : ""
          }${s.for && !selectedFor ? ` (for: ${s.for})` : ""}`
      )
      .join("\n");

    const completedCount = filteredByFor.filter((s) => s.isCompleted).length;
    const pendingCount = filteredByFor.filter((s) => !s.isCompleted).length;

    const footer = `\n\n📊 *Summary*:\n• Total: ${
      filteredByFor.length
    }\n• Completed: ${completedCount}\n• Pending: ${pendingCount}\n• Progress: ${
      filteredByFor.length > 0
        ? Math.round((completedCount / filteredByFor.length) * 100)
        : 0
    }%`;

    return `${header}\n\n${subtaskLines}${footer}`;
  };

  // ✅ Notification handlers
  const sendWhatsApp = async () => {
    try {
      const message = buildMessage();

      // Send to all contacts with phone numbers
      const phoneContacts = notificationContacts.filter((c) => c.phone?.trim());

      if (phoneContacts.length === 0) {
        toast.error("No WhatsApp contacts configured");
        return;
      }

      for (const contact of phoneContacts) {
        await NotificationService.sendWhatsAppMessage(contact.phone!, message)
          .then(() => {
            toast.success("Notification Send on Watsapp successfully");
          })
          .catch((e) => {
            toast.error(e.message);
          });
      }
    } catch (error: any) {
      toast.error(`Failed to send WhatsApp: ${error.message}`);
    }
  };

  const sendEmail = async () => {
    // const message = buildMessage();
    const subject = `Task Update: ${currentTask.title}${
      selectedFor ? ` (for ${selectedFor})` : ""
    }`;

    const emailContacts = notificationContacts.filter((c) => c.email?.trim());
    if (emailContacts.length === 0) {
      toast.error("No email contacts configured");
      return;
    }

    // Example: show subtasks in the list
    const taskItems =
      dailyTaskSubTask?.map(
        (t: SubTask) =>
          `- ${t.title}: ${t.isCompleted ? "Completed" : "Not Completed \n"}`
      ) || [];

    for (const contact of emailContacts) {
      await NotificationService.sendEmail(
        contact.email!,
        subject,
        "Daily Task Progress",
        "These are the task",
        taskItems // ✅ goes into <ul> in UniversalEmail
      )
        .then(() => {
          toast.success(`Email sent to ${emailContacts.length} contact(s)`);
        })
        .catch((e) => {
          toast.error(`Failed to send email: ${e.message}`);
        });
    }
  };

  const shareExternal = () => {
    const message = buildMessage();
    const title = `${currentTask.title}${
      selectedFor ? ` (for ${selectedFor})` : ""
    }`;

    if (navigator.share) {
      navigator
        .share({
          text: message,
          title: title,
        })
        .then(() => {
          toast.success("Shared successfully");
        })
        .catch((error) => {
          toast.error("Failed to share");
        });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(message)
        .then(() => {
          toast.success("Task details copied to clipboard");
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard");
        });
    }
  };

  const completedSubtasks = filteredByFor.filter((s) => s.isCompleted);
  const pendingSubtasks = filteredByFor.filter((s) => !s.isCompleted);
  const completionPercentage =
    filteredByFor.length > 0
      ? Math.round((completedSubtasks.length / filteredByFor.length) * 100)
      : 0;

  // Whenever percentage changes → update Firestore
  useEffect(() => {
    if (currentTask.id) {
      TaskService.updateTaskStatus(currentTask.id, completionPercentage)
        
        .catch((e) => {
          toast.error(e.message);
        });
    }
  }, [completionPercentage, currentTask]);

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Task not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{currentTask.title}</h1>
            <p className="text-muted-foreground">
              {currentTask.type} • For {currentTask.for}
              {selectedFor && (
                <Badge variant="outline" className="ml-2">
                  Filtered: {selectedFor}
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* For Filter Dropdown */}
          {uniqueFors.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedFor || "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by person</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSelectedFor(null)}
                  className={!selectedFor ? "bg-accent" : ""}
                >
                  All
                </DropdownMenuItem>
                {uniqueFors.map((forValue) => (
                  <DropdownMenuItem
                    key={forValue}
                    onClick={() => setSelectedFor(forValue)}
                    className={selectedFor === forValue ? "bg-accent" : ""}
                  >
                    {forValue}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setContactsDialog(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingSubtask(null);
              setSubTaskDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* ✅ Notification Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Share & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={sendWhatsApp}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Send WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={sendEmail}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={shareExternal}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share External
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {selectedFor
              ? `Sharing ${filteredByFor.length} items for ${selectedFor}`
              : `Sharing all ${taskSubtasks.length} items`}
          </p>
        </CardContent>
      </Card>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTask.description && (
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {currentTask.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {currentTask.dueDate && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Due Date</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(currentTask.dueDate)}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium mb-1">Status</h3>
                <Badge
                  variant={
                    completionPercentage === 100 ? "default" : "secondary"
                  }
                >
                  {completionPercentage === 100 ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{completionPercentage}% Complete</span>
                  <span>
                    {completedSubtasks.length}/{filteredByFor.length}
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {filteredByFor.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg dark:bg-green-950/30">
                  <div className="text-2xl font-bold text-green-600">
                    {completedSubtasks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg dark:bg-orange-950/30">
                  <div className="text-2xl font-bold text-orange-600">
                    {pendingSubtasks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subtasks Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>
              {currentTask.type === "Grocery" ? "Shopping List" : "Subtasks"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredSubtasks.length} items)
              </span>
            </CardTitle>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-8 w-[180px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex gap-1">
                    <Filter className="h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("all")}
                    className={statusFilter === "all" ? "bg-accent" : ""}
                  >
                    All items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("completed")}
                    className={statusFilter === "completed" ? "bg-accent" : ""}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("pending")}
                    className={statusFilter === "pending" ? "bg-accent" : ""}
                  >
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {filteredSubtasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>For</TableHead>
                  {currentTask.type !== "Grocery" && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubtasks.map((subtask) => (
                  <TableRow
                    key={subtask.id}
                    className={subtask.isCompleted ? "bg-muted/30" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Checkbox
                          checked={subtask.isCompleted}
                          onCheckedChange={() =>
                            TaskService.toggleSubtaskCompletion(
                              subtask.id,
                              subtask.isCompleted
                            )
                          }
                          className="h-5 w-5 rounded-full cursor-pointer hover:scale-105"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{subtask.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {subtask.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {subtask.for ? (
                          <Badge variant="outline">{subtask.for}</Badge>
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                    {currentTask.type !== "Grocery" && (
                      <TableCell className="text-right">
                        <ActionMenu
                          item={subtask}
                          onDelete={(subtaskId) => {
                            setDeletingSubTask(subtaskId);
                            setDeleteModalOpen(true);
                          }}
                          onEdit={(subtask) => {
                            setEditingSubtask(subtask);
                            setSubTaskDialog(true);
                          }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <div className="text-muted-foreground mb-4">
                {taskSubtasks.length === 0
                  ? currentTask.type === "Grocery"
                    ? "No items in your shopping list yet."
                    : "No subtasks yet."
                  : "No items match your search criteria."}
              </div>
              {taskSubtasks.length === 0 && (
                <Button onClick={() => setSubTaskDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          )}
        </CardContent>

        {taskSubtasks.length > 0 && (
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-xs text-muted-foreground">
              Showing {filteredSubtasks.length} of {taskSubtasks.length} items
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingSubtask(null);
                setSubTaskDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Dialogs */}
      <EnhancedSubTaskDialog
        open={subTaskDialog}
        onOpenChange={setSubTaskDialog}
        editingSubtask={editingSubtask}
        taskId={taskId as string}
        task={currentTask}
        allSubtasks={taskSubtasks}
        notificationContacts={notificationContacts}
        onSave={handleSave}
        onCancel={() => setEditingSubtask(null)}
      />

      <NotificationContactsDialog
        open={contactsDialog}
        onOpenChange={setContactsDialog}
        contacts={notificationContacts}
        onSave={setNotificationContacts}
      />

      <ConfirmDialog
        open={deletingDialogOpen}
        lockWhilePending
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingSubTask("");
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
