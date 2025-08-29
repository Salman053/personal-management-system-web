"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { derivePlaceholders } from "@/lib/email-helpers";
import { EmailTemplate } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { addTemplate, updateTemplate } from "@/services/templates";
import { CustomSelect } from "../shared/custom-select";

/**
 * Simple Template Editor (non-rich-editor).
 * - Placeholder manager is separate: add / remove tokens explicitly
 * - You can insert placeholders into subject/body by clicking a badge (inserts token at caret end)
 */

const Categories = ["Job Application", "Friendly", "Professional", "Custom"];
const types = ["Personal", "Business", "Academics", "Casual"];
type Props = {
  template: EmailTemplate;
  onClose: () => void;
  onSaved: () => void;
};

export default function TemplateEditor({ template, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(template.title);
  const [category, setCategory] = useState<EmailTemplate["category"]>(
    template.category
  );
  const [subject, setSubject] = useState(template.subject);
  const [type, setType] = useState(template.type);

  const [body, setBody] = useState(template.body);
  const [placeholders, setPlaceholders] = useState<string[]>(
    template.placeholders || []
  );
  const [newPlaceholder, setNewPlaceholder] = useState("");

  useEffect(() => {
    // keep placeholders in sync with text if they exist in subject/body
    const derived = derivePlaceholders(subject, body);
    setPlaceholders((prev) => Array.from(new Set([...prev, ...derived])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPlaceholder = () => {
    const key = newPlaceholder.trim().replace(/[^a-zA-Z0-9_\- ]/g, "");
    if (!key) return;
    if (!placeholders.includes(key)) setPlaceholders((s) => [...s, key]);
    setNewPlaceholder("");
  };

  const handleRemovePlaceholder = (key: string) => {
    setPlaceholders((s) => s.filter((p) => p !== key));
  };

  const insertTokenIntoBody = (token: string, where: "subject" | "body") => {
    const tokenText = `{{${token}}}`;
    if (where === "subject")
      setSubject((s) => (s ? s + " " + tokenText : tokenText));
    else setBody((s) => (s ? s + "\n" + tokenText : tokenText));
  };

  const handleSave = async () => {
    const payload = {
      userId: user?.uid,
      title,
      category,
      subject,
      body,
      placeholders,
      type: type || "personal",
      updatedAt: Date.now(),
    };

    if (!template.id) {
      await addTemplate(user?.uid as string, payload);
    } else {
      await updateTemplate(user?.uid as string, template.id, payload);
    }

    onSaved();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {template.id ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Title (e.g., Job Application - Frontend)"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <CustomSelect
              options={Categories}
              required
              placeholder="Category"
              value={category}
              onChange={(value) => setCategory(value as any)}
            />
            <CustomSelect
              required

              options={types}
              placeholder="Type (personal/business)"
              value={type}
              onChange={(value) => setType(value)}
            />
          </div>

          <Input
            placeholder="Subject (use placeholders from the list)"
            value={subject}

            required
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="Body (plain text or simple HTML). Use insert buttons to add placeholders."
            rows={10}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Placeholders</div>
              <div className="text-xs text-gray-500">
                Use placeholders to make templates reusable
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {placeholders.map((p) => (
                <Badge key={p} className="flex items-center gap-2">
                  <span>{`{{${p}}}`}</span>
                  <div className="flex gap-1">
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={() => insertTokenIntoBody(p, "subject")}
                    >
                      Insert into subject
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={() => insertTokenIntoBody(p, "body")}
                    >
                      Insert into body
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={() => handleRemovePlaceholder(p)}
                    >
                      Remove
                    </Button>
                  </div>
                </Badge>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Add placeholder (e.g., name or company)"
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
              />
              <Button onClick={handleAddPlaceholder}>Add</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
