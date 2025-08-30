"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Eye,
  Copy,
  Share,
  Trash2,
  Plus,
  X,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  EmailTemplate,
  TemplateCategory,
  TemplateFormData,
  TemplateType,
} from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { TemplateValidator } from "@/lib/validation";
import { TemplateService } from "@/services/templates";
import { TemplateUtils } from "@/lib/template-utils";
import {
  CATEGORY_METADATA,
  COMMON_PLACEHOLDERS,
  TEMPLATE_TYPES,
} from "@/constants/email-const";

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave?: (template: EmailTemplate) => void;
  onCancel?: () => void;
  onPreview?: (template: EmailTemplate) => void;
}

export function TemplateEditor({
  template,
  onSave,
  onCancel,
  onPreview,
}: TemplateEditorProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<TemplateFormData>({
    title: template?.title || "",
    category: template?.category || "Professional",
    subject: template?.subject || "",
    body: template?.body || "",
    type: template?.type || "standard",
    tags: template?.tags || [],
  });

  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPlaceholderHelper, setShowPlaceholderHelper] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !user) return;

    const autoSaveTimer = setTimeout(async () => {
      if (template?.id) {
        try {
          await handleSave(true); // Silent save
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, autoSaveEnabled, hasUnsavedChanges, user, template?.id]);

  // Track changes
  useEffect(() => {
    if (template) {
      const hasChanges =
        formData.title !== template.title ||
        formData.category !== template.category ||
        formData.subject !== template.subject ||
        formData.body !== template.body ||
        formData.type !== template.type ||
        JSON.stringify(formData.tags) !== JSON.stringify(template.tags);

      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(
        formData.title.trim() !== "" ||
          formData.subject.trim() !== "" ||
          formData.body.trim() !== ""
      );
    }
  }, [formData, template]);

  const handleInputChange = useCallback(
    (field: keyof TemplateFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field-specific errors
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSave = async (silent = false) => {
    console.log("handleSave called, silent:", silent);
    console.log("user:", user);
    console.log("formData:", formData);

    if (!user) {
      toast("Please sign in to save templates.");
      return;
    }

    // Validate form data
    const validationErrors = TemplateValidator.validateTemplate(formData);
     console.log("validationErrors:", validationErrors);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);

      if (!silent) {
        toast.success("Please fix the errors before saving.");
      }
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedData = TemplateValidator.sanitizeTemplateData(formData);

      if (template?.id) {
        // Update existing template
        await TemplateService.updateTemplate(
          user.uid,
          template.id,
          sanitizedData
        );
        const updatedTemplate = await TemplateService.getTemplate(
          user.uid,
          template.id
        );

        if (updatedTemplate && onSave) {
          onSave(updatedTemplate);
        }

        if (!silent) {
          toast.success("Your template has been successfully updated.");
        }
      } else {
        // Create new template
        const templateId = await TemplateService.createTemplate(
          user.uid,
          sanitizedData
        );
        const newTemplate = await TemplateService.getTemplate(
          user.uid,
          templateId
        );

        if (newTemplate && onSave) {
          onSave(newTemplate);
        }

        if (!silent) {
          toast.success("Your template has been successfully created.");
        }
      }

      setHasUnsavedChanges(false);
      setErrors({});
    } catch (error) {
      console.error("Error saving template:", error);
      if (!silent) {
        toast.error("Failed to save template. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !template?.id) return;

    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await TemplateService.deleteTemplate(user.uid, template.id);
      toast.success("Your template has been successfully deleted.");
      onCancel?.();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!user || !template?.id) return;

    setIsLoading(true);
    try {
      const duplicatedId = await TemplateService.duplicateTemplate(
        user.uid,
        template.id
      );
      const duplicatedTemplate = await TemplateService.getTemplate(
        user.uid,
        duplicatedId
      );

      if (duplicatedTemplate && onSave) {
        onSave(duplicatedTemplate);
      }

      toast.success("A copy of your template has been created.");
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      const previewTemplate: EmailTemplate = {
        id: template?.id || "preview",
        ...formData,
        placeholders: TemplateUtils.extractPlaceholders(
          formData.subject,
          formData.body
        ),
        createdAt: template?.createdAt || new Date(),
        updatedAt: new Date(),
        userId: user?.uid || "",
      };
      onPreview(previewTemplate);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const placeholderText = `{{${placeholder}}}`;

    // Insert into body at cursor position (simplified - in real app you'd track cursor position)
    setFormData((prev) => ({
      ...prev,
      body: prev.body + placeholderText,
    }));
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      !formData.tags?.includes(newTag.trim().toLowerCase())
    ) {
      handleInputChange("tags", [
        ...(formData.tags || []),
        newTag.trim().toLowerCase(),
      ]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags?.filter((tag) => tag !== tagToRemove) || []
    );
  };

  const categoryMetadata = CATEGORY_METADATA[formData.category];
  const detectedPlaceholders = TemplateUtils.extractPlaceholders(
    formData.subject,
    formData.body
  );

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {template ? "Edit Template" : "Create Template"}
          </h1>
          <p className="text-muted-foreground">
            {template
              ? "Update your email template"
              : "Create a new email template with placeholders"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600">
              Unsaved changes
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            Auto-save: {autoSaveEnabled ? "On" : "Off"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter template title..."
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: TemplateCategory) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.category ? "border-destructive w-full" : "w-full"
                      }
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_METADATA).map(
                        ([key, metadata]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center text-left gap-2">
                              <span>{metadata.icon}</span>
                              <span>{metadata.category}</span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: TemplateType) =>
                      handleInputChange("type", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.type ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPES).map(([key, typeInfo]) => (
                        <SelectItem key={key} value={key}>
                          <div className="text-left">
                            <div className="font-medium">{typeInfo.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {typeInfo.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type}</p>
                  )}
                </div>
              </div>

              {/* Category Description */}
              <div className={`p-3 rounded-lg ${categoryMetadata.color}`}>
                <p className="text-sm">{categoryMetadata.description}</p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Enter email subject..."
                  className={errors.subject ? "border-destructive" : ""}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject}</p>
                )}
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  placeholder="Enter email body with placeholders like {{name}}..."
                  className={`min-h-[300px] ${errors.body ? "border-destructive" : ""}`}
                />
                {errors.body && (
                  <p className="text-sm text-destructive">{errors.body}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => handleSave()}
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {template ? "Update" : "Save"} Template
              </Button>

              <Button
                variant="outline"
                onClick={handlePreview}
                className="w-full bg-transparent"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              {template && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleDuplicate}
                    disabled={isLoading}
                    className="w-full bg-transparent"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <Separator />

                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}

              {onCancel && (
                <Button variant="ghost" onClick={onCancel} className="w-full">
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Placeholder Helper */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Placeholders</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowPlaceholderHelper(!showPlaceholderHelper)
                  }
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Detected Placeholders */}
              {detectedPlaceholders.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    DETECTED ({detectedPlaceholders.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detectedPlaceholders.map((placeholder) => (
                      <Badge
                        key={placeholder}
                        variant="outline"
                        className="text-xs"
                      >
                        {placeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Placeholders */}
              {showPlaceholderHelper && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    COMMON PLACEHOLDERS
                  </Label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {COMMON_PLACEHOLDERS.map((placeholder) => (
                      <Button
                        key={placeholder.key}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto p-2 text-xs"
                        onClick={() => insertPlaceholder(placeholder.key)}
                      >
                        <div>
                          <div className="font-medium">{placeholder.label}</div>
                          <div className="text-muted-foreground">{`{{${placeholder.key}}}`}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Suggestions */}
              {categoryMetadata.defaultPlaceholders.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    SUGGESTED FOR {formData.category.toUpperCase()}
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categoryMetadata.defaultPlaceholders.map((placeholder) => (
                      <Button
                        key={placeholder}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 bg-transparent"
                        onClick={() => insertPlaceholder(placeholder)}
                      >
                        {placeholder}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
