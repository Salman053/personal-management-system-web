"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, AlertCircle } from "lucide-react"
import type { TemplateFormData, PlaceholderValues } from "@/types"
import { TemplateUtils } from "@/lib/template-utils"
import { CATEGORY_METADATA } from "@/constants/email-const"

interface TemplateLivePreviewProps {
  formData: TemplateFormData
  placeholderValues?: PlaceholderValues
  className?: string
}

export function TemplateLivePreview({ formData, placeholderValues = {}, className = "" }: TemplateLivePreviewProps) {
  const categoryMetadata = CATEGORY_METADATA[formData.category]

  const detectedPlaceholders = useMemo(() => {
    return TemplateUtils.extractPlaceholders(formData.subject, formData.body)
  }, [formData.subject, formData.body])

  const preview = useMemo(() => {
    return {
      subject: TemplateUtils.replacePlaceholders(formData.subject, placeholderValues),
      body: TemplateUtils.replacePlaceholders(formData.body, placeholderValues),
    }
  }, [formData.subject, formData.body, placeholderValues])

  const hasEmptyFields = !formData.title.trim() || !formData.subject.trim() || !formData.body.trim()
  const hasUnfilledPlaceholders = detectedPlaceholders.some((placeholder) => !placeholderValues[placeholder]?.trim())

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Preview
          {hasEmptyFields && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Incomplete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Info */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${categoryMetadata.color.split(" ")[0]}`} />
          <span className="font-medium">{formData.title || "Untitled Template"}</span>
          <Badge variant="outline" className="text-xs">
            {formData.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formData.type}
          </Badge>
        </div>

        {/* Placeholders Info */}
        {detectedPlaceholders.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{detectedPlaceholders.length} placeholders detected:</span>
            <div className="flex flex-wrap gap-1">
              {detectedPlaceholders.slice(0, 3).map((placeholder) => (
                <Badge
                  key={placeholder}
                  variant="outline"
                  className={`text-xs ${
                    placeholderValues[placeholder]?.trim()
                      ? "border-green-200 text-green-700"
                      : "border-amber-200 text-amber-700"
                  }`}
                >
                  {placeholder}
                </Badge>
              ))}
              {detectedPlaceholders.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{detectedPlaceholders.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Subject Preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">SUBJECT</p>
          <div className="p-3 bg-muted/50 rounded-lg border min-h-[2.5rem] flex items-center">
            {preview.subject ? (
              <p className="text-sm font-medium text-foreground">{preview.subject}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Enter a subject line...</p>
            )}
          </div>
        </div>

        {/* Body Preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">BODY</p>
          <div className="p-3 bg-muted/50 rounded-lg border min-h-[8rem] max-h-[12rem] overflow-y-auto">
            {preview.body ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{preview.body}</div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Enter email body content...</p>
            )}
          </div>
        </div>

        {/* Warnings */}
        {hasUnfilledPlaceholders && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs font-medium">Some placeholders are not filled</p>
            </div>
            <p className="text-xs text-amber-700 mt-1">Fill placeholder values to see the complete preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
