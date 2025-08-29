"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useMainContext } from "@/contexts/app-context";
import { projectsService } from "@/services/projects";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectsTable } from "@/components/projects/projects-table";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/system/confirm-dialog";
import { useModalState } from "@/hooks/use-modal-state";
import { CustomSelect } from "@/components/shared/custom-select";
import { Project } from "@/types";

export default function ProjectsPage() {
  // const { user } = useAuth();
  const { projects } = useMainContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed" | "paused"
  >("all");
  const [filterType, setFilterType] = useState<"all" | "client" | "personal">(
    "all"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { modalState, toggleModal } = useModalState({
    isDeletingDialog: false,
  });
  const [selectedProject, setSelectedProject] = useState<Project | any>(null);

  // 

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    try {
      await projectsService.deleteProject(selectedProject).then(() => {
        toast.success("The project is Deleted Successfully");
        toggleModal("isDeletingDialog");
      });
    } catch (error: any) {
      toast.error("Error : " + error.message);
      console.error("Error deleting project:", error);
    }
  };

  const handleProjectSaved = async () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const matchesType = filterType === "all" || project.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === "active").length,
    completed: projects.filter((p: any) => p.status === "completed").length,
    client: projects.filter((p: any) => p.type === "client").length,
    personal: projects.filter((p: any) => p.type === "personal").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your client and personal projects
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Client Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.client}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personal Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.personal}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <CustomSelect value={filterStatus} options={statusOptions} onChange={(value) => setFilterStatus(value as any)} />


              <CustomSelect value={filterType} options={statusTypes} onChange={(value) => setFilterType(value as any)} />
            
           
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <ProjectsTable
        projects={filteredProjects}
        loading={false}
        onEdit={handleEditProject}
        onDelete={(projectId) => {
          setSelectedProject(projectId);
          toggleModal("isDeletingDialog");
        }}
      />

      <ConfirmDialog
        requireText="Delete"
        onCancel={() => toggleModal("isDeletingDialog")}
        onConfirm={handleDeleteProject}
        open={modalState.isDeletingDialog}
        onOpenChange={() => toggleModal("isDeletingDialog")}
        destructive
        lockWhilePending
      />
      {/* Project Dialog */}
      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
        onSave={handleProjectSaved}
      />
    </div>
  );
}



const statusOptions = [
  {
    label:"All Status",
    value:"all"
  },
    {
    label:"Active",
    value:"active"
    },
      {
    label:"Completed",
    value:"completed"
  },  {
    label:"",
    value:"paused"
  }
]

const statusTypes = [
   {
    label:"All",
    value:"all"
  },
    {
    label:"Client",
    value:"client"
    },
      {
    label:"Personal",
    value:"personal"
  }
]
