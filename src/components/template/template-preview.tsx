"use client";

import React from "react";
import { EmailTemplate } from "@/types/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  template: EmailTemplate;
  onEdit?: () => void;
  onUse?: () => void;
};

export default function TemplatePreview({ template, onEdit, onUse }: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{template.title}</h3>
          <div className="text-sm text-muted-foreground">
            {template.category} · updated{" "}
            {new Date(template.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button onClick={onUse}>Use Template</Button>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-500">Subject</div>
          <div className="font-medium">
            {template.subject || <span className="text-gray-400">—</span>}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Body</div>
          <div className="whitespace-pre-wrap border rounded p-3 bg-surface">
            {template.body || <span className="text-gray-400">—</span>}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Placeholders</div>
          <div className="flex gap-2 flex-wrap">
            {template.placeholders.length === 0 && (
              <div className="text-sm text-gray-400">No placeholders</div>
            )}
            {template.placeholders.map((p) => (
              <div
                key={p}
                className="px-2 py-1 rounded bg-muted-foreground/10 text-sm"
              >{`{{${p}}}`}</div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
