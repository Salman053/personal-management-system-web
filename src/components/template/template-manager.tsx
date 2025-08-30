"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, List, Settings, Upload } from "lucide-react";
import { TemplateDashboard } from "./template-dashboard";
import { TemplateList } from "./template-list";
import { TemplateEditor } from "./template-editor";
import { TemplatePreviewModal } from "./template-preview-modal";
import { TemplateSharing } from "./template-sharing";
import { TemplateImport } from "./template-import";
import { EmailTemplate } from "@/types";
import { toast } from "sonner";

interface TemplateManagerProps {
  className?: string;
}

export function TemplateManager({ className = "" }: TemplateManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shouldCreateNew = searchParams.get("create") === "true";
  const [activeTab, setActiveTab] = useState(
    shouldCreateNew ? "editor" : "dashboard"
  );
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [sharingTemplate, setSharingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "n":
            event.preventDefault();
            handleCreateNew();
            break;
          case "s":
            event.preventDefault();
            // Save current template if in editor
            if (activeTab === "editor") {
              // This would trigger save in the editor component
              toast("Save template (Ctrl+S)");
            }
            break;
          case "p":
            event.preventDefault();
            // Preview current template if in editor
            if (activeTab === "editor") {
              toast("Preview template (Ctrl+P)");
            }
            break;
          case "f":
            event.preventDefault();
            // Focus search if in list view
            if (activeTab === "list") {
              const searchInput = document.querySelector(
                'input[placeholder*="Search"]'
              ) as HTMLInputElement;
              searchInput?.focus();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  useEffect(() => {
    if (shouldCreateNew) {
      // Remove the create parameter from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("create");
      window.history.replaceState({}, "", url.toString());
    }
  }, [shouldCreateNew]);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setActiveTab("editor");
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setActiveTab("editor");
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleShareTemplate = (template: EmailTemplate) => {
    setSharingTemplate(template);
    setShowSharingModal(true);
  };

  const handleSaveTemplate = (template: EmailTemplate) => {
    setEditingTemplate(null);
    setActiveTab("list");
    toast("Your template has been saved successfully.");
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setActiveTab("list");
  };

  const handleImportSuccess = (templates: EmailTemplate[]) => {
    setActiveTab("list");
    toast(`${templates.length} templates imported successfully.`);
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingTemplate ? "Edit" : "Create"}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab !== "editor" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowImportModal(true)}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button onClick={handleCreateNew} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <TabsContent value="dashboard" className="space-y-6">
            <TemplateDashboard
              onCreateNew={handleCreateNew}
              onEditTemplate={handleEditTemplate}
              onPreviewTemplate={handlePreviewTemplate}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <TemplateList
              onCreateNew={handleCreateNew}
              onEditTemplate={handleEditTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              onShareTemplate={handleShareTemplate}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <TemplateEditor
              template={editingTemplate || undefined}
              onSave={handleSaveTemplate}
              onCancel={handleCancelEdit}
              onPreview={handlePreviewTemplate}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewTemplate(null);
          }}
        />

        <TemplateSharing
          template={sharingTemplate}
          isOpen={showSharingModal}
          onClose={() => {
            setShowSharingModal(false);
            setSharingTemplate(null);
          }}
        />

        <TemplateImport
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
}
