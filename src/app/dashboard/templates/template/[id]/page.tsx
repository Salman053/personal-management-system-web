"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Share2,
  Copy,
  Trash2,
  Download,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { EmailTemplate } from "@/types";
import { TemplateService } from "@/services/templates";
import { toast } from "sonner";
import { TemplateUtils } from "@/lib/template-utils";
import { TemplateEditor } from "@/components/template/template-editor";
import { TemplatePreview } from "@/components/template/template-preview";
import { TemplateSharing } from "@/components/template/template-sharing";

const TemplateCategory = [
  "Job Application",
  "Academic",
  "Professional",
  "Friendly",
  "Custom",
];

export default function TemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSharing, setShowSharing] = useState(false);

  const templateId = params.id as string;

  useEffect(() => {
    if (!user || !templateId) {
      router.push("/");
      return;
    }

    loadTemplate();
  }, [user, templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const templateData = await TemplateService.getTemplate(
        user?.uid as string,
        templateId
      );

      if (!templateData) {
        toast("The requested template could not be found.");
        router.push("/");
        return;
      }

      // Check if user has access to this template
      if (templateData.userId !== user?.uid && !templateData.isShared) {
        toast("You don't have permission to view this template.");
        router.push("/");
        return;
      }

      setTemplate(templateData);
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedTemplate: Partial<EmailTemplate>) => {
    if (!template) return;

    try {
      await TemplateService.updateTemplate(
        user?.uid as string,
        template.id,
        updatedTemplate
      );
      await loadTemplate();
      setIsEditing(false);
      toast("Your changes have been saved successfully.");
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!template || !confirm("Are you sure you want to delete this template?"))
      return;

    try {
      await TemplateService.deleteTemplate(user?.uid as string, template.id);
      toast("The template has been deleted successfully.");
      router.push("/");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template. Please try again.");
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;

    try {
      const duplicated = await TemplateService.createTemplate(
        user?.uid as string,

        {
          title: `${template.title} (Copy)`,
          category: template.category,
          subject: template.subject,
          body: template.body,
          // placeholders: template.placeholders, // Removed to match TemplateFormData type
          tags: template.tags,
          type: "standard",
        }
      );

      toast("A copy of the template has been created.");

      router.push(`/dashboard/templates/template/${duplicated}`);
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template. Please try again.");
    }
  };

  const handleExport = () => {
    if (!template) return;

    const exportData = TemplateUtils.formatForExport(template, "txt");
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Template has been downloaded as JSON file.");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Template content has been copied.");
    } catch (error) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Template not found</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  const category = TemplateCategory.find(
    (cat: any) => cat.id === template.category
  );
  const isOwner = template.userId === user?.uid;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <h1 className="text-2xl font-semibold">Edit Template</h1>
          </div>

          <TemplateEditor
            template={template}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
          
            <div>
              <h1 className="text-2xl font-semibold text-balance">
                {template.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {category && (
                  <Badge variant="secondary" className="text-xs">
                    <Box className="w-3 h-3 mr-1" />
                    {/* {category?.name} */}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </span>
                {/* {template.lastUsed && (
                  <span className="text-sm text-muted-foreground">
                    • Last used{" "}
                    {new Date(template.lastUsed).toLocaleDateString()}
                  </span>
                )} */}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  TemplateUtils.replacePlaceholders(template.body, {})
                )
              }
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSharing(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Template Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subject
                  </label>
                  <p className="text-sm mt-1 text-pretty">{template.subject}</p>
                </div>

                {Array.isArray(template?.tags) && template.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.placeholders.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Placeholders
                    </label>
                    <div className="space-y-1 mt-1">
                      {template.placeholders.map((placeholder, index) => (
                        <div
                          key={index}
                          className="text-xs bg-muted rounded px-2 py-1"
                        >
                          {/* <code>{placeholder.key}</code> */}
                          {placeholder && (
                            <span className="text-muted-foreground ml-2">
                              - {placeholder}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Used {template.shareId} times</p>
                  <p>
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                  {template.isShared && <p>Shared publicly</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplatePreview
                  template={template}
                  showPlaceholderInputs={true}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sharing Modal */}

      <TemplateSharing
        template={template}
        isOpen={showSharing}
        onClose={() => setShowSharing(false)}
        // onUpdate={(updated) => setTemplate(updated)}
      />
    </div>
  );
}
