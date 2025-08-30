"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Mail, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmailTemplate } from "@/types";
import { CATEGORY_METADATA } from "@/constants/email-const";
import { toast } from "sonner";

interface TemplateQuickPreviewProps {
  template: EmailTemplate;
  onPreview?: (template: EmailTemplate) => void;
  onEdit?: (template: EmailTemplate) => void;
  onDuplicate?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
  className?: string;
}

export function TemplateQuickPreview({
  template,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  className = "",
}: TemplateQuickPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const categoryMetadata = CATEGORY_METADATA[template.category];

  const copyToClipboard = async () => {
    try {
      const text = `Subject: ${template.subject}\n\n${template.body}`;
      await navigator.clipboard.writeText(text);
      toast("Template copied successfully.");
    } catch (error) {
      toast.error("Failed to copy template.");
    }
  };

  const openInEmailClient = () => {
    const subject = encodeURIComponent(template.subject);
    const body = encodeURIComponent(template.body);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(template)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryMetadata.color.split(" ")[0]}`}
            />
            <h3 className="font-semibold text-sm text-foreground truncate">
              {template.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 ml-2">
            {isHovered && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(template);
                  }}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInEmailClient();
                  }}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview?.(template)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(template)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(template)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={`text-xs ${categoryMetadata.color}`}
          >
            {categoryMetadata.icon} {template.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {template.type}
          </Badge>
          {template.placeholders.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {template.placeholders.length} placeholders
            </Badge>
          )}
        </div>

        {/* Subject Preview */}
        <div className="mb-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            SUBJECT
          </p>
          <p className="text-sm font-medium text-foreground">
            {truncateText(template.subject, 60)}
          </p>
        </div>

        {/* Body Preview */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            PREVIEW
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {truncateText(template.body.replace(/\n/g, " "), 120)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated {template.updatedAt.toLocaleDateString()}</span>
          {template.tags && template.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {template.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 2 && (
                <span>+{template.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
