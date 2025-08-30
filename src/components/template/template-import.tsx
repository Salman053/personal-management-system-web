"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { TemplateValidator } from "@/lib/validation";
import { EmailTemplate, TemplateFormData } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { TemplateService } from "@/services/templates";
import { toast } from "sonner";

interface TemplateImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (templates: EmailTemplate[]) => void;
}

export function TemplateImport({
  isOpen,
  onClose,
  onImportSuccess,
}: TemplateImportProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importText, setImportText] = useState("");
  const [parsedTemplates, setParsedTemplates] = useState<TemplateFormData[]>(
    []
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
      parseImportText(content);
    };
    reader.readAsText(file);
  };

  const parseImportText = (text: string) => {
    try {
      setValidationErrors([]);

      // Try to parse as JSON first
      let templates: any[];
      try {
        const parsed = JSON.parse(text);
        templates = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If JSON parsing fails, try to parse as plain text template
        templates = [parseTextTemplate(text)];
      }

      const validTemplates: TemplateFormData[] = [];
      const errors: string[] = [];

      templates.forEach((template, index) => {
        try {
          const templateData: TemplateFormData = {
            title: template.title || `Imported Template ${index + 1}`,
            category: template.category || "Custom",
            subject: template.subject || "",
            body: template.body || "",
            type: template.type || "standard",
            tags: template.tags || [],
          };

          const validationErrors =
            TemplateValidator.validateTemplate(templateData);
          if (validationErrors.length > 0) {
            errors.push(
              `Template ${index + 1}: ${validationErrors.map((e) => e.message).join(", ")}`
            );
          } else {
            validTemplates.push(templateData);
          }
        } catch (error) {
          errors.push(`Template ${index + 1}: Invalid format`);
        }
      });

      setParsedTemplates(validTemplates);
      setValidationErrors(errors);
    } catch (error) {
      setValidationErrors([
        "Invalid format. Please provide valid JSON or text template.",
      ]);
      setParsedTemplates([]);
    }
  };

  const parseTextTemplate = (text: string): any => {
    const lines = text.split("\n");
    let title = "";
    let subject = "";
    let body = "";
    let inBody = false;

    for (const line of lines) {
      if (line.startsWith("Title:")) {
        title = line.replace("Title:", "").trim();
      } else if (line.startsWith("Subject:")) {
        subject = line.replace("Subject:", "").trim();
      } else if (line.startsWith("Body:")) {
        inBody = true;
      } else if (inBody) {
        body += line + "\n";
      }
    }

    return {
      title: title || "Imported Template",
      subject: subject,
      body: body.trim(),
      category: "Custom",
      type: "standard",
    };
  };

  const handleImport = async () => {
    if (!user || parsedTemplates.length === 0) return;

    setIsImporting(true);
    try {
      const importedTemplates: EmailTemplate[] = [];

      for (const templateData of parsedTemplates) {
        const templateId = await TemplateService.createTemplate(
          user.uid,
          templateData
        );
        const template = await TemplateService.getTemplate(
          user.uid,
          templateId
        );
        if (template) {
          importedTemplates.push(template);
        }
      }

      toast(`Successfully imported ${importedTemplates.length} templates.`);

      onImportSuccess?.(importedTemplates);
      onClose();

      // Reset state
      setImportText("");
      setParsedTemplates([]);
      setValidationErrors([]);
    } catch (error) {
      console.error("Error importing templates:", error);
      toast.error("Failed to import templates. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <Label>Upload File</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-transparent"
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supports JSON files or plain text templates
            </p>
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <Label>Or Paste Template Data</Label>
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                if (e.target.value.trim()) {
                  parseImportText(e.target.value);
                } else {
                  setParsedTemplates([]);
                  setValidationErrors([]);
                }
              }}
              placeholder="Paste JSON template data or plain text template here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-destructive">
                    Validation Errors
                  </h3>
                </div>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Parsed Templates Preview */}
          {parsedTemplates.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Ready to Import ({parsedTemplates.length} templates)
                  </h3>
                </div>
                <div className="space-y-3">
                  {parsedTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {template.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.body}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                parsedTemplates.length === 0 ||
                validationErrors.length > 0 ||
                isImporting
              }
            >
              {isImporting
                ? "Importing..."
                : `Import ${parsedTemplates.length} Templates`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
