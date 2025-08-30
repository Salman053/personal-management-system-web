"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail, Download } from "lucide-react";
import type { EmailTemplate, PlaceholderValues } from "@/types";
import { TemplateUtils } from "@/lib/template-utils";
import { toast } from "sonner";

interface TemplatePreviewModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
}: TemplatePreviewModalProps) {
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValues>(
    {}
  );

  if (!template) return null;

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({ ...prev, [key]: value }));
  };

  const preview = TemplateUtils.generatePreview(template, placeholderValues);

  const copyToClipboard = async (
    text: string,
    type: "subject" | "body" | "both"
  ) => {
    try {
      let textToCopy = "";

      switch (type) {
        case "subject":
          textToCopy = preview.subject;
          break;
        case "body":
          textToCopy = preview.body;
          break;
        case "both":
          textToCopy = `Subject: ${preview.subject}\n\n${preview.body}`;
          break;
      }

      await navigator.clipboard.writeText(textToCopy);
      toast(`Email ${type} copied successfully.`);
    } catch (error) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const openInEmailClient = () => {
    const subject = encodeURIComponent(preview.subject);
    const body = encodeURIComponent(preview.body);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  const exportTemplate = (format: "txt" | "html") => {
    const content =
      format === "txt"
        ? `Subject: ${preview.subject}\n\n${preview.body}`
        : `<h3>${preview.subject}</h3><div style="white-space: pre-wrap;">${preview.body}</div>`;

    const blob = new Blob([content], {
      type: format === "txt" ? "text/plain" : "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" md:min-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preview: {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Placeholder Values */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fill Placeholders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.placeholders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No placeholders found in this template.
                  </p>
                ) : (
                  template.placeholders.map((placeholder) => (
                    <div key={placeholder} className="space-y-1">
                      <Label
                        htmlFor={placeholder}
                        className="text-xs font-medium"
                      >
                        {placeholder
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <Input
                        id={placeholder}
                        value={placeholderValues[placeholder] || ""}
                        onChange={(e) =>
                          handlePlaceholderChange(placeholder, e.target.value)
                        }
                        placeholder={`Enter ${placeholder}...`}
                        className="text-sm"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Email Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      SUBJECT LINE
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(preview.subject, "subject")
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">
                      {preview.subject || "Subject will appear here..."}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Body Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      EMAIL BODY
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(preview.body, "body")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg min-h-[200px]">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {preview.body || "Email body will appear here..."}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button
                    onClick={() => copyToClipboard("", "both")}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>

                  <Button
                    variant="outline"
                    onClick={openInEmailClient}
                    className="flex-1 bg-transparent"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open in Email
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => exportTemplate("txt")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export TXT
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => exportTemplate("html")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export HTML
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
