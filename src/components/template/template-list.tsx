"use client";

import React from "react";
import { EmailTemplate } from "@/types/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  templates: EmailTemplate[];
  onSelect: (t: EmailTemplate) => void;
  onEdit: (t: EmailTemplate) => void;
  onDelete: (id: string) => void;
};

export default function TemplateList({
  templates,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-2">
      {templates.length === 0 && (
        <div className="text-sm text-gray-500">No templates yet.</div>
      )}
      {templates.map((t) => (
        <Card
          key={t.id}
          className="p-3 hover:shadow-md transition rounded-lg cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div onClick={() => onSelect(t)} className="flex-1">
              <div className="font-medium">
                {t.title || <span className="text-gray-400">Untitled</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.category} · updated{" "}
                {new Date(t.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="ghost" onClick={() => onEdit(t)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(t.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
