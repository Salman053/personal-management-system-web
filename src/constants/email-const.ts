import type { CategoryMetadata, TemplateCategory, TemplateType } from "@/types"

export const CATEGORY_METADATA: Record<TemplateCategory, CategoryMetadata> = {
  "Job Application": {
    category: "Job Application",
    icon: "💼",
    description: "Professional templates for job applications, cover letters, and career correspondence",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    defaultPlaceholders: ["company_name", "position_title", "hiring_manager", "your_name", "your_email", "your_phone"],
  },
  Academic: {
    category: "Academic",
    icon: "🎓",
    description: "Templates for academic correspondence, research inquiries, and educational communication",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    defaultPlaceholders: ["professor_name", "university_name", "course_name", "student_name", "student_id", "semester"],
  },
  Professional: {
    category: "Professional",
    icon: "🏢",
    description: "General business and professional communication templates",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    defaultPlaceholders: ["recipient_name", "company_name", "your_name", "your_title", "project_name", "deadline"],
  },
  Friendly: {
    category: "Friendly",
    icon: "😊",
    description: "Casual and friendly email templates for informal communication",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    defaultPlaceholders: ["friend_name", "your_name", "event_name", "date", "location"],
  },
  Custom: {
    category: "Custom",
    icon: "⚙️",
    description: "Custom templates for specific use cases and personal preferences",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    defaultPlaceholders: ["recipient", "sender", "subject_matter", "date"],
  },
}

export const TEMPLATE_TYPES: Record<TemplateType, { label: string; description: string }> = {
  standard: {
    label: "Standard",
    description: "Balanced tone suitable for most professional communications",
  },
  formal: {
    label: "Formal",
    description: "Professional and respectful tone for official correspondence",
  },
  casual: {
    label: "Casual",
    description: "Relaxed and friendly tone for informal communications",
  },
}

export const COMMON_PLACEHOLDERS = [
  { key: "your_name", label: "Your Name", required: true },
  { key: "your_email", label: "Your Email", required: false },
  { key: "your_phone", label: "Your Phone", required: false },
  { key: "recipient_name", label: "Recipient Name", required: true },
  { key: "company_name", label: "Company Name", required: false },
  { key: "position_title", label: "Position Title", required: false },
  { key: "date", label: "Date", required: false },
  { key: "location", label: "Location", required: false },
]

export const MAX_TEMPLATE_TITLE_LENGTH = 100
export const MAX_TEMPLATE_SUBJECT_LENGTH = 200
export const MAX_TEMPLATE_BODY_LENGTH = 10000
export const MAX_TAGS_PER_TEMPLATE = 10
export const MAX_TAG_LENGTH = 30
