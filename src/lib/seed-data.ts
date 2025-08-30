import type { TemplateFormData } from "@/types"

export const SEED_TEMPLATES: TemplateFormData[] = [
  {
    title: "Job Application - Software Developer",
    category: "Job Application",
    type: "formal",
    subject: "Application for {{position_title}} Position at {{company_name}}",
    body: `Dear {{hiring_manager}},

I am writing to express my strong interest in the {{position_title}} position at {{company_name}}. With my background in software development and passion for creating innovative solutions, I believe I would be a valuable addition to your team.

In my previous role, I have:
• Developed and maintained web applications using modern technologies
• Collaborated with cross-functional teams to deliver high-quality software
• Implemented best practices for code quality and testing

I am particularly drawn to {{company_name}} because of {{company_reason}}. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
{{your_name}}
{{your_email}}
{{your_phone}}`,
    tags: ["software", "developer", "tech", "application"],
  },
  {
    title: "Academic Research Inquiry",
    category: "Academic",
    type: "formal",
    subject: "Research Inquiry - {{research_topic}}",
    body: `Dear Professor {{professor_name}},

I hope this email finds you well. I am {{student_name}}, a {{student_level}} student at {{university_name}} studying {{field_of_study}}.

I am writing to inquire about potential research opportunities in your lab, specifically related to {{research_topic}}. I have been following your work on {{specific_research}} and find it fascinating.

My background includes:
• {{relevant_experience_1}}
• {{relevant_experience_2}}
• {{relevant_skills}}

I would be grateful for the opportunity to discuss potential research projects or volunteer opportunities in your lab. I am available for a meeting at your convenience.

Thank you for your time and consideration.

Sincerely,
{{student_name}}
{{student_email}}`,
    tags: ["research", "academic", "professor", "inquiry"],
  },
  {
    title: "Professional Follow-up",
    category: "Professional",
    type: "standard",
    subject: "Following up on {{meeting_topic}}",
    body: `Hi {{recipient_name}},

I hope you're doing well. I wanted to follow up on our conversation about {{meeting_topic}} from {{meeting_date}}.

As discussed, I've {{action_taken}} and wanted to share the results with you. {{key_points}}

Next steps:
• {{next_step_1}}
• {{next_step_2}}
• {{next_step_3}}

Please let me know if you have any questions or if there's anything else I can help with.

Best regards,
{{your_name}}`,
    tags: ["follow-up", "meeting", "professional", "business"],
  },
  {
    title: "Friendly Check-in",
    category: "Friendly",
    type: "casual",
    subject: "Hey {{friend_name}}! How are things?",
    body: `Hey {{friend_name}}!

Hope you're doing amazing! I was just thinking about you and wanted to check in. How have things been with {{topic_of_interest}}?

I've been {{your_recent_activity}} and thought you might find it interesting. {{shared_experience}}

Would love to catch up soon! Are you free for {{activity_suggestion}} sometime next week?

Talk soon!
{{your_name}}`,
    tags: ["friendly", "casual", "check-in", "personal"],
  },
  {
    title: "Project Proposal",
    category: "Professional",
    type: "formal",
    subject: "Proposal: {{project_name}}",
    body: `Dear {{recipient_name}},

I am pleased to present this proposal for {{project_name}}. This project aims to {{project_objective}} and will deliver significant value to {{company_name}}.

Project Overview:
{{project_description}}

Key Deliverables:
• {{deliverable_1}}
• {{deliverable_2}}
• {{deliverable_3}}

Timeline: {{project_timeline}}
Budget: {{project_budget}}

I believe this project will {{expected_outcome}} and look forward to discussing this opportunity with you.

Best regards,
{{your_name}}
{{your_title}}
{{your_company}}`,
    tags: ["proposal", "project", "business", "formal"],
  },
]

export const DEFAULT_USER_PREFERENCES = {
  defaultCategory: "Professional" as const,
  defaultType: "standard" as const,
  autoSave: true,
  defaultPlaceholders: {
    your_name: "",
    your_email: "",
    your_phone: "",
    your_title: "",
    your_company: "",
  },
  recentCategories: ["Professional", "Job Application"] as const,
  favoriteTemplates: [],
}
