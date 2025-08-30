import { CATEGORY_METADATA } from "@/constants/email-const"
import type { EmailTemplate, PlaceholderValues, TemplateCategory } from "@/types"

export class TemplateUtils {
  // Generate a unique share ID for template sharing
  static generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Extract all unique placeholders from a template
  static extractPlaceholders(subject: string, body: string): string[] {
    const text = `${subject} ${body}`
    const placeholderRegex = /\{\{([^}]+)\}\}/g
    const placeholders: string[] = []
    let match

    while ((match = placeholderRegex.exec(text)) !== null) {
      const placeholder = match[1].trim()
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder)
      }
    }

    return placeholders.sort()
  }

  // Replace placeholders in text with actual values
  static replacePlaceholders(text: string, values: PlaceholderValues): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
      const key = placeholder.trim()
      return values[key] || match
    })
  }

  // Generate preview text with placeholder values
  static generatePreview(template: EmailTemplate, values: PlaceholderValues): { subject: string; body: string } {
    return {
      subject: this.replacePlaceholders(template.subject, values),
      body: this.replacePlaceholders(template.body, values),
    }
  }

  // Get category metadata
  static getCategoryMetadata(category: TemplateCategory) {
    return CATEGORY_METADATA[category]
  }

  // Format template for export
  static formatForExport(template: EmailTemplate, format: "json" | "txt" | "html"): string {
    switch (format) {
      case "json":
        return JSON.stringify(template, null, 2)

      case "txt":
        return `Title: ${template.title}
Category: ${template.category}
Type: ${template.type}
Subject: ${template.subject}

Body:
${template.body}

Placeholders: ${template.placeholders.join(", ")}
Created: ${template.createdAt.toLocaleDateString()}
Updated: ${template.updatedAt.toLocaleDateString()}`

      case "html":
        return `<!DOCTYPE html>
<html>
<head>
    <title>${template.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
        .meta { color: #666; font-size: 14px; }
        .subject { font-weight: bold; margin: 20px 0; }
        .body { line-height: 1.6; white-space: pre-wrap; }
        .placeholders { margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.title}</h1>
        <div class="meta">
            Category: ${template.category} | Type: ${template.type}<br>
            Created: ${template.createdAt.toLocaleDateString()} | Updated: ${template.updatedAt.toLocaleDateString()}
        </div>
    </div>
    
    <div class="subject">
        <strong>Subject:</strong> ${template.subject}
    </div>
    
    <div class="body">
        <strong>Body:</strong><br>
        ${template.body}
    </div>
    
    <div class="placeholders">
        <strong>Placeholders:</strong> ${template.placeholders.join(", ")}
    </div>
</body>
</html>`

      default:
        return JSON.stringify(template, null, 2)
    }
  }

  // Calculate template statistics
  static calculateStats(templates: EmailTemplate[]) {
    const stats = {
      totalTemplates: templates.length,
      templatesByCategory: {} as Record<TemplateCategory, number>,
      recentlyUsed: templates
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
        .map((t) => t.id),
      mostUsedPlaceholders: this.getMostUsedPlaceholders(templates),
    }

    // Count templates by category
    templates.forEach((template) => {
      stats.templatesByCategory[template.category] = (stats.templatesByCategory[template.category] || 0) + 1
    })

    return stats
  }

  // Get most frequently used placeholders across all templates
  private static getMostUsedPlaceholders(templates: EmailTemplate[]): string[] {
    const placeholderCount: Record<string, number> = {}

    templates.forEach((template) => {
      template.placeholders.forEach((placeholder) => {
        placeholderCount[placeholder] = (placeholderCount[placeholder] || 0) + 1
      })
    })

    return Object.entries(placeholderCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([placeholder]) => placeholder)
  }

  // Search templates by multiple criteria
  static searchTemplates(templates: EmailTemplate[], query: string, category?: TemplateCategory): EmailTemplate[] {
    const searchTerm = query.toLowerCase().trim()

    return templates.filter((template) => {
      // Category filter
      if (category && template.category !== category) {
        return false
      }

      // Text search
      if (searchTerm) {
        return (
          template.title.toLowerCase().includes(searchTerm) ||
          template.subject.toLowerCase().includes(searchTerm) ||
          template.body.toLowerCase().includes(searchTerm) ||
          template.category.toLowerCase().includes(searchTerm) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          template.placeholders.some((placeholder) => placeholder.toLowerCase().includes(searchTerm))
        )
      }

      return true
    })
  }
}
