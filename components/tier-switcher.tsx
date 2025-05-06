"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useTiers } from "@/hooks/useTiers";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, LayersIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "./ui/sheet";
import { Skeleton } from "./ui/skeleton";

export function TierSwitcher() {
  const { isMobile } = useSidebar();
  const { tiers, isLoading, addTier, updateTier, deleteTier, updateTierActiveStatus } = useTiers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tierName, setTierName] = useState("");
  const [newTierName, setNewTierName] = useState("");
  const [selectedTier, setSelectedTier] = useState<{ id: string; name: string; } | null>(null);

  const handleCreateTier = async () => {
    if (!newTierName.trim()) return;
    addTier(newTierName);
    setNewTierName("");
    setIsCreateDialogOpen(false);
  };

  const openEditDialog = (tier: { id: string; name: string; }) => {
    setSelectedTier(tier);
    setTierName(tier.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tier: { id: string; name: string; }) => {
    setSelectedTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const handleEditTier = async () => {
    if (!selectedTier || !tierName.trim()) return;
    updateTier(selectedTier.id, tierName);
    setTierName("");
    setSelectedTier(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTier = async () => {
    if (!selectedTier) return;

    // Prevent deletion if it's the last tier
    if (tiers.length <= 1) {
      setIsDeleteDialogOpen(false);
      return;
    }

    const isActiveTier = selectedTier.id === tiers.find(t => t.isActive)?.id;

    deleteTier(selectedTier.id);

    // If we deleted the active tier, set the first remaining tier as active
    if (isActiveTier) {
      const firstTier = tiers.find(t => t.id !== selectedTier.id);
      if (firstTier) {
        // Assuming there's a method to set active tier in the useTiers hook
        // similar to handleSetActiveProject in ProjectSwitcher
        updateTierActiveStatus(firstTier.id, true);
      }
    }

    setSelectedTier(null);
    setIsDeleteDialogOpen(false);
  };

  const handleSetActiveTier = async (tier: { id: string; name: string; }) => {
    updateTierActiveStatus(tier.id, true);
  };

  const tierSwitcherContent = isLoading ? (
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
              <LayersIcon className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {tiers.find(t => t.isActive)?.name || "Select Tier"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-md" side="bottom" sideOffset={4}>
          <DropdownMenuLabel>Tiers</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tiers.map(t => (
            <DropdownMenuItem onClick={() => handleSetActiveTier(t)} key={t.id} className="group">
              <div className="flex items-center w-full">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                  <LayersIcon className="h-4 w-4" />
                </div>
                <div className="grid flex-1 gap-1 ml-2">
                  <span className={cn(
                    "truncate",
                    t.isActive && "text-primary font-semibold"
                  )}>
                    {t.name}
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
                    openEditDialog(t);
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                {tiers.length > 1 && <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(t);
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
              <span>Create Tier</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet modal={true} open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Tier</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Input
              placeholder="Tier name"
              value={newTierName}
              onChange={(e) => setNewTierName(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTier}>Create</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet modal={true} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Tier</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Input
              placeholder="Tier name"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTier}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTier}
        title="Delete Tier"
        description="Are you sure you want to delete this tier? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );

  return tierSwitcherContent;
}