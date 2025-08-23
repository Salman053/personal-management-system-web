"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

type ActionMenuProps<T> = {
  item: T;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (id: string) => void;
  deleteLabel?: string;
  editLabel?: string;
  viewLabel?: string;
};

export function ActionMenu<T extends { id?: string }>({
  item,
  onView,
  onEdit,
  onDelete,
  deleteLabel = "Delete",
  editLabel = "Edit",
  viewLabel = "View",
}: ActionMenuProps<T>) {
  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem
            onAction={() => {
              onView(item);
              document.body.style.pointerEvents = "auto";
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            {viewLabel}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onAction={() => {
              onEdit(item);
              document.body.style.pointerEvents = "auto";
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onDelete && item.id && (
          <DropdownMenuItem
            onAction={() => {
              onDelete(item.id!);
              document.body.style.pointerEvents = "auto";
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
