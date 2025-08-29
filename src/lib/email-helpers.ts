import { EmailTemplate } from "@/types";

/**
 * Extract placeholders from subject/body text.
 * Placeholders are tokens like: {{name}} or {{ position }}.
 */
export function extractPlaceholdersFromText(text: string): string[] {
  if (!text) return [];
  const regex = /{{\s*([a-zA-Z0-9_\. -]+?)\s*}}/g;
  const matches = [...text.matchAll(regex)];
  const set = new Set<string>();
  for (const m of matches) {
    set.add(m[1].trim());
  }
  return Array.from(set);
}

/**
 * Merge placeholders array from subject and body.
 */
export function derivePlaceholders(subject: string, body: string): string[] {
  const a = extractPlaceholdersFromText(subject);
  const b = extractPlaceholdersFromText(body);
  return Array.from(new Set([...a, ...b]));
}

/**
 * Render template by replacing placeholder keys with provided values.
 * If a value is missing, uses empty string.
 */
export function renderTemplate(template: EmailTemplate, values: Record<string, string>) {
  let subject = template.subject;
  let body = template.body;

  for (const key of template.placeholders) {
    const token = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, "g");
    const val = values[key] ?? "";
    subject = subject.replace(token, val);
    body = body.replace(token, val);
  }
  return { subject, body };
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}