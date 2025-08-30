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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Share, Download, Link, Mail } from "lucide-react";
import type { EmailTemplate } from "@/types";
import { TemplateUtils } from "@/lib/template-utils";
import { toast } from "sonner";

interface TemplateSharingProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSharing({
  template,
  isOpen,
  onClose,
}: TemplateSharingProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  if (!template) return null;

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      // In a real app, this would create a shareable link via API
      const shareId = TemplateUtils.generateShareId();
      const url = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(url);

      toast("Your template can now be shared with others.");
    } catch (error) {
      toast.error("Failed to generate share link.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${type} copied successfully.`);
    } catch (error) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const exportTemplate = (format: "json" | "txt" | "html") => {
    const content = TemplateUtils.formatForExport(template, format);
    const blob = new Blob([content], {
      type:
        format === "json"
          ? "application/json"
          : format === "html"
            ? "text/html"
          : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast(`Template exported as ${format.toUpperCase()} file.`);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `Check out this email template: ${template.title}`
    );
    const body =
      encodeURIComponent(`I wanted to share this email template with you:

Title: ${template.title}
Category: ${template.category}
Type: ${template.type}

Subject: ${template.subject}

Body:
${template.body}

${shareUrl ? `You can also view it online: ${shareUrl}` : ""}`);

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Template: {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {template.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{template.category}</Badge>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Subject:</strong> {template.subject}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Placeholders:</strong>{" "}
                {template.placeholders.join(", ") || "None"}
              </p>
            </CardContent>
          </Card>

          {/* Share Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share Link</Label>
            {shareUrl ? (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, "Share link")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={generateShareLink}
                disabled={isGeneratingLink}
                className="w-full"
              >
                <Link className="h-4 w-4 mr-2" />
                {isGeneratingLink ? "Generating..." : "Generate Share Link"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view and copy your template
            </p>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Template</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() => exportTemplate("json")}
                className="bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => exportTemplate("txt")}
                className="bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                variant="outline"
                onClick={() => exportTemplate("html")}
                className="bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                HTML
              </Button>
            </div>
          </div>

          <Separator />

          {/* Share Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share Via</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex-1 bg-transparent"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(
                    `${template.title}\n\nSubject: ${template.subject}\n\n${template.body}`,
                    "Template content"
                  )
                }
                className="flex-1 bg-transparent"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
