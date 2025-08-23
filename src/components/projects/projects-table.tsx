"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { ActionMenu } from "../ui/action-menu";
// import { ProjectDetailDialog } from "./project-detail-dialog"

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectsTable({
  projects,
  loading,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "personal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleViewDetails = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground">
              No projects found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first project to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <Table className="">
            <TableHeader className="">
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Budget</TableHead>
                {/* <TableHead>Progress</TableHead> */}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {project.description.slice(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(project.type)}>
                      {project.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(project.startDate).toDateString()}
                  </TableCell>
                  <TableCell>
                    {project.endDate
                      ? new Date(project.endDate).toDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {project.totalAmount ? (
                      <div>
                        <div className="font-medium">
                          Total: Rs. {project.totalAmount.toLocaleString()}
                        </div>
                        {project.advanceAmount !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            Paid: Rs. {project.advanceAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {/* <TableCell>
                    {project.totalAmount && project.paidAmount !== undefined ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((project.paidAmount / project.totalAmount) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell> */}
                  <TableCell>
                    <ActionMenu
                      item={project}
                      onView={() => handleViewDetails(project)}
                      onEdit={() => onEdit(project)}
                      onDelete={() => onDelete(project.id as string)}
                    />
                    
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
