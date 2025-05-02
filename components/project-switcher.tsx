"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  useSidebar
} from "@/components/ui/sidebar";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { mainQueryClient } from "@/providers/projects-provider";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, FolderIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "./ui/sheet";
import { Skeleton } from "./ui/skeleton";

export function ProjectSwitcher() {
  const queryClient = useQueryClient(mainQueryClient);

  const { isMobile } = useSidebar();
  const { projects, loading, onSetUserActive, createProject, updateProject, deleteProject } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string; } | null>(null);

  const handleSetActiveProject = async (project: { id: string; name: string; }) => {
    await onSetUserActive(project.id);
    queryClient.invalidateQueries({ queryKey: ['tiers'] });
    queryClient.invalidateQueries({ queryKey: ['tier-summary'] });
  };

  const openEditDialog = (project: { id: string; name: string; }) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: { id: string; name: string; }) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName);
    setNewProjectName("");
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tiers'] });
    queryClient.invalidateQueries({ queryKey: ['tier-summary'] });
  };

  const handleEditProject = async () => {
    if (!selectedProject || !projectName.trim()) return;
    await updateProject(selectedProject.id, projectName);
    setProjectName("");
    setSelectedProject(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProject: () => Promise<void> = async () => {
    if (!selectedProject) return;

    // Prevent deletion if it's the last project
    if (projects.length <= 1) {
      setIsDeleteDialogOpen(false);
      return;
    }

    const isActiveProject = selectedProject.id === projects.find(p => p.isActive)?.id;

    await deleteProject(selectedProject.id);

    // If we deleted the active project, set the first remaining project as active
    if (isActiveProject) {
      const firstProject = projects.find(p => p.id !== selectedProject.id);
      if (firstProject) {
        await handleSetActiveProject(firstProject);
      }
    }

    setSelectedProject(null);
    setIsDeleteDialogOpen(false);
  };

  const projectSwitcherContent = loading ? (
    <div className="relative flex border-b items-center justify-start gap-2 p-2">
      <div className="w-56 rounded-md border p-2">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="ml-2 h-4 w-4 shrink-0" />
        </div>
      </div>
    </div>
  ) : (
    <div className="relative flex border-b items-center justify-start gap-2 p-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-56 rounded-md border p-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted/50">
              <FolderIcon className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {projects.find(p => p.isActive)?.name}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-md" side="bottom" sideOffset={4}>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map(p => (
            <DropdownMenuItem key={p.id} className="group">
              <div className="flex items-center w-full" onClick={() => handleSetActiveProject(p)}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                  <FolderIcon className="h-4 w-4" />
                </div>
                <div className="grid flex-1 gap-1 ml-2">
                  <span className={cn(
                    "truncate font-medium",
                    p.isActive && "text-primary font-semibold"
                  )}>
                    {p.name}
                  </span>
                </div>
              </div>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(p);
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                {projects.length > 1 && <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(p);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Project</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet modal={true} open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Project</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet modal={true} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditProject}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );

  return projectSwitcherContent;
}



