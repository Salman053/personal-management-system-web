import type { TemplateFormData, TemplateValidationError } from "@/types/index"

export class TemplateValidator {
    static validateTemplate(data: TemplateFormData): TemplateValidationError[] {
        const errors: TemplateValidationError[] = []

        // Title validation
        if (!data.title || data.title.trim().length === 0) {
            errors.push({ field: "title", message: "Title is required" })
        } else if (data.title.length > 100) {
            errors.push({ field: "title", message: "Title must be less than 100 characters" })
        }

        // Category validation
        if (!data.category) {
            errors.push({ field: "category", message: "Category is required" })
        }

        // Subject validation
        if (!data.subject || data.subject.trim().length === 0) {
            errors.push({ field: "subject", message: "Subject is required" })
        } else if (data.subject.length > 200) {
            errors.push({ field: "subject", message: "Subject must be less than 200 characters" })
        }

        // Body validation
        if (!data.body || data.body.trim().length === 0) {
            errors.push({ field: "body", message: "Body is required" })
        } else if (data.body.length > 10000) {
            errors.push({ field: "body", message: "Body must be less than 10,000 characters" })
        }

        // Type validation
        if (!data.type) {
            errors.push({ field: "type", message: "Type is required" })
        }

        // Validate placeholders in subject and body
        const placeholderErrors = this.validatePlaceholders(data.subject + " " + data.body)
        errors.push(...placeholderErrors)

        return errors
    }

    static validatePlaceholders(text: string): TemplateValidationError[] {
        const errors: TemplateValidationError[] = []
        const placeholderRegex = /\{\{([^}]+)\}\}/g
        const placeholders: string[] = []
        let match

        while ((match = placeholderRegex.exec(text)) !== null) {
            const placeholder = match[1].trim()

            // Check for empty placeholders
            if (placeholder.length === 0) {
                errors.push({ field: "placeholders", message: "Empty placeholder found: {{}}" })
                continue
            }

            // Check for invalid characters
            if (!/^[a-zA-Z0-9_\s]+$/.test(placeholder)) {
                errors.push({
                    field: "placeholders",
                    message: `Invalid placeholder: {{${placeholder}}}. Use only letters, numbers, underscores, and spaces.`,
                })
            }

            // Check for duplicate placeholders
            if (placeholders.includes(placeholder)) {
                errors.push({
                    field: "placeholders",
                    message: `Duplicate placeholder found: {{${placeholder}}}`,
                })
            } else {
                placeholders.push(placeholder)
            }
        }

        return errors
    }

    static sanitizeTemplateData(data: TemplateFormData): TemplateFormData {
        return {
            title: data.title.trim(),
            category: data.category,
            subject: data.subject.trim(),
            body: data.body.trim(),
            type: data.type,
            tags: data.tags?.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0),
        }
    }
}
