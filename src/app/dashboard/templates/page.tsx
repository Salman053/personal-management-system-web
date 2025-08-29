"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailTemplate } from "@/types";
import UseTemplateModal from "@/components/template/template-use-dialog";
import TemplateEditor from "@/components/template/template-editor";
import { deleteTemplate } from "@/services/templates";
import { useMainContext } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import TemplatePreview from "@/components/template/template-preview";
import TemplateList from "@/components/template/template-list";

/**
 * IMPORTANT: Replace currentUserId with your auth user ID retrieval (next-auth, firebase auth, etc.)
 * Here it's hardcoded for demo, but in real app read from auth state.
 */

export default function TemplatesPage() {
  const { user } = useAuth();
  const { emailTemplates } = useMainContext();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [openUseModal, setOpenUseModal] = useState(false);

  useEffect(() => {
    if (emailTemplates) {
      setTemplates(emailTemplates);
    }
  }, [emailTemplates]);

  const handleCreate = () => {
    setEditing({
      id: "",
      userId: user?.uid as string,
      title: "",
      category: "Job Application",
      subject: "",
      body: "",
      placeholders: [],
      type: "personal",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleSaved = async () => {
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(user?.uid as string, id);
    setSelected(null);
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Templates</h2>
          <Button size="sm" onClick={handleCreate}>
            + New
          </Button>
        </div>
        <TemplateList
          templates={templates}
          onSelect={(t) => setSelected(t)}
          onEdit={(t) => setEditing(t)}
          onDelete={(id) => handleDelete(id)}
        />
      </aside>

      <main className="col-span-9">
        {selected ? (
          <TemplatePreview
            template={selected}
            onEdit={() => setEditing(selected)}
            onUse={() => {
              setOpenUseModal(true);
            }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 h-[400px] flex items-center justify-center text-gray-400">
            Select a template to preview or create a new one.
          </div>
        )}
      </main>

      {editing && (
        <TemplateEditor
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {openUseModal && selected && (
        <UseTemplateModal
          template={selected}
          onClose={() => setOpenUseModal(false)}
        />
      )}
    </div>
  );
}
