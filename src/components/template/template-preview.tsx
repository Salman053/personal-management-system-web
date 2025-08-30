"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail, Eye, EyeOff, Settings } from "lucide-react";
import type { EmailTemplate, PlaceholderValues } from "@/types";
import { TemplateUtils } from "@/lib/template-utils";
import { CATEGORY_METADATA } from "@/constants/email-const";
import { toast } from "sonner";

interface TemplatePreviewProps {
  template: EmailTemplate;
  initialPlaceholderValues?: PlaceholderValues;
  showPlaceholderInputs?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function TemplatePreview({
  template,
  initialPlaceholderValues = {},
  showPlaceholderInputs = true,
  showActions = true,
  compact = false,
  className = "",
}: TemplatePreviewProps) {
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValues>(
    initialPlaceholderValues
  );
  const [showPlaceholders, setShowPlaceholders] = useState(
    showPlaceholderInputs
  );

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({ ...prev, [key]: value }));
  };

  const preview = TemplateUtils.generatePreview(template, placeholderValues);
  const categoryMetadata = CATEGORY_METADATA[template.category];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${type} copied successfully.`);
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${categoryMetadata.color.split(" ")[0]}`}
            />
            <h3 className="font-semibold text-foreground">{template.title}</h3>
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.type}
            </Badge>
          </div>

          {showPlaceholderInputs && template.placeholders.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaceholders(!showPlaceholders)}
              className="text-muted-foreground"
            >
              {showPlaceholders ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}

      <div
        className={`grid gap-4 ${showPlaceholders && template.placeholders.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}
      >
        {/* Placeholder Inputs */}
        {showPlaceholders && template.placeholders.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Placeholders ({template.placeholders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.placeholders.map((placeholder) => (
                  <div key={placeholder} className="space-y-1">
                    <Label
                      htmlFor={`preview-${placeholder}`}
                      className="text-xs font-medium"
                    >
                      {placeholder
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    <Input
                      id={`preview-${placeholder}`}
                      value={placeholderValues[placeholder] || ""}
                      onChange={(e) =>
                        handlePlaceholderChange(placeholder, e.target.value)
                      }
                      placeholder={`Enter ${placeholder}...`}
                      className="text-sm h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Content */}
        <div
          className={
            showPlaceholders && template.placeholders.length > 0
              ? "lg:col-span-2"
              : "lg:col-span-1"
          }
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Email Preview
                </CardTitle>
                {compact && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    SUBJECT
                  </Label>
                  {showActions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(preview.subject, "Subject")
                      }
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="font-medium text-sm text-foreground">
                    {preview.subject || (
                      <span className="text-muted-foreground italic">
                        Subject will appear here...
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Body Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    BODY
                  </Label>
                  {showActions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(preview.body, "Body")}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div
                  className={`p-4 bg-muted/50 rounded-lg border ${compact ? "max-h-32 overflow-y-auto" : "min-h-[150px]"}`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {preview.body || (
                      <span className="text-muted-foreground italic">
                        Email body will appear here...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `Subject: ${preview.subject}\n\n${preview.body}`,
                        "Email"
                      )
                    }
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy All
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInEmailClient}
                    className="flex-1 bg-transparent"
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Open Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Info */}
      {!compact && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Created: {template.createdAt.toLocaleDateString()}</span>
                <span>Updated: {template.updatedAt.toLocaleDateString()}</span>
                <span>Placeholders: {template.placeholders.length}</span>
              </div>
              {template.tags && template.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
