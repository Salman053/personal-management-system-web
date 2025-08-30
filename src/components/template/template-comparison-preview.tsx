"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, GitCompare } from "lucide-react"
import type { EmailTemplate, PlaceholderValues } from "@/types"
import { TemplateUtils } from "@/lib/template-utils"
import { CATEGORY_METADATA } from "@/constants/email-const"

interface TemplateComparisonPreviewProps {
  originalTemplate: EmailTemplate
  updatedTemplate: EmailTemplate
  placeholderValues?: PlaceholderValues
  className?: string
}

export function TemplateComparisonPreview({
  originalTemplate,
  updatedTemplate,
  placeholderValues = {},
  className = "",
}: TemplateComparisonPreviewProps) {
  const originalPreview = TemplateUtils.generatePreview(originalTemplate, placeholderValues)
  const updatedPreview = TemplateUtils.generatePreview(updatedTemplate, placeholderValues)

  const originalCategoryMetadata = CATEGORY_METADATA[originalTemplate.category]
  const updatedCategoryMetadata = CATEGORY_METADATA[updatedTemplate.category]

  const hasChanges =
    originalTemplate.title !== updatedTemplate.title ||
    originalTemplate.category !== updatedTemplate.category ||
    originalTemplate.subject !== updatedTemplate.subject ||
    originalTemplate.body !== updatedTemplate.body ||
    originalTemplate.type !== updatedTemplate.type

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitCompare className="h-4 w-4" />
          Template Comparison
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
              Changes Detected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Template */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">ORIGINAL</h3>
              <div className={`w-2 h-2 rounded-full ${originalCategoryMetadata.color.split(" ")[0]}`} />
            </div>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">TITLE</p>
                <p className="text-sm font-medium">{originalTemplate.title}</p>
              </div>

              {/* Category & Type */}
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {originalTemplate.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {originalTemplate.type}
                </Badge>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">SUBJECT</p>
                <div className="p-2 bg-muted/50 rounded border">
                  <p className="text-sm">{originalPreview.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">BODY</p>
                <div className="p-2 bg-muted/50 rounded border max-h-32 overflow-y-auto">
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{originalPreview.body}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Updated Template */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-primary">UPDATED</h3>
              <div className={`w-2 h-2 rounded-full ${updatedCategoryMetadata.color.split(" ")[0]}`} />
            </div>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">TITLE</p>
                <p
                  className={`text-sm font-medium ${
                    originalTemplate.title !== updatedTemplate.title ? "text-primary font-semibold" : ""
                  }`}
                >
                  {updatedTemplate.title}
                </p>
              </div>

              {/* Category & Type */}
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    originalTemplate.category !== updatedTemplate.category ? "border-primary text-primary" : ""
                  }`}
                >
                  {updatedTemplate.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    originalTemplate.type !== updatedTemplate.type ? "border-primary text-primary" : ""
                  }`}
                >
                  {updatedTemplate.type}
                </Badge>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">SUBJECT</p>
                <div
                  className={`p-2 rounded border ${
                    originalTemplate.subject !== updatedTemplate.subject
                      ? "bg-primary/10 border-primary/20"
                      : "bg-muted/50"
                  }`}
                >
                  <p className="text-sm">{updatedPreview.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">BODY</p>
                <div
                  className={`p-2 rounded border max-h-32 overflow-y-auto ${
                    originalTemplate.body !== updatedTemplate.body ? "bg-primary/10 border-primary/20" : "bg-muted/50"
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{updatedPreview.body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {hasChanges && (
          <>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Changes Summary:</p>
              <ul className="space-y-1">
                {originalTemplate.title !== updatedTemplate.title && <li>• Title updated</li>}
                {originalTemplate.category !== updatedTemplate.category && <li>• Category changed</li>}
                {originalTemplate.type !== updatedTemplate.type && <li>• Type changed</li>}
                {originalTemplate.subject !== updatedTemplate.subject && <li>• Subject modified</li>}
                {originalTemplate.body !== updatedTemplate.body && <li>• Body content updated</li>}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
