"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Action<T> = {
  label: string;
  icon?: React.ReactNode;
  onSelect: (item: T) => void;
  danger?: boolean; // e.g. delete action
};

type CustomActionMenuDropdownProps<T> = {
  item: T;
  actions: Action<T>[];
  triggerLabel?: string;
};

export function CustomActionMenuDropdown<T extends { id?: string }>({
  item,
  actions,
  triggerLabel = "Actions",
}: CustomActionMenuDropdownProps<T>) {
  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, idx) => (
          <DropdownMenuItem
            key={idx}
            onSelect={() => action.onSelect(item)}
            className={action.danger ? "text-red-600 focus:text-red-700" : ""}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
