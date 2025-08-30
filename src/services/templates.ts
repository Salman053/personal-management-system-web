import { db } from "@/lib/firebase"
import { EmailTemplate, TemplateFormData } from "@/types"
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    serverTimestamp,
    type Timestamp,
} from "firebase/firestore"

const templatesRef = collection(db, "templates")
export class TemplateService {
    // Create a new template
    static async createTemplate(userId: string, templateData: TemplateFormData): Promise<string> {
        try {


            // Extract placeholders from subject and body
            const placeholders = this.extractPlaceholders(templateData.subject + " " + templateData.body)

            const docRef = await addDoc(templatesRef, {
                ...templateData,
                placeholders,
                userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isShared: false,
            })

            return docRef.id
        } catch (error) {
            console.error("Error creating template:", error)
            throw new Error("Failed to create template")
        }
    }

    // Get all templates for a user
    static async getUserTemplates(userId: string): Promise<EmailTemplate[]> {
        try {
            const q = query(templatesRef, orderBy("updatedAt", "desc"))
            const querySnapshot = await getDocs(q)

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
                updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
            })) as EmailTemplate[]
        } catch (error) {
            console.error("Error fetching templates:", error)
            throw new Error("Failed to fetch templates")
        }
    }

    // Get a specific template
    static async getTemplate(userId: string, templateId: string): Promise<EmailTemplate | null> {
        try {
            const docSnap = await getDoc(doc(db, "templates", templateId))

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                } as EmailTemplate
            }

            return null
        } catch (error) {
            console.error("Error fetching template:", error)
            throw new Error("Failed to fetch template")
        }
    }

    // Update a template
    static async updateTemplate(userId: string, templateId: string, updates: Partial<TemplateFormData>): Promise<void> {
        try {

            // Extract placeholders if subject or body changed
            let placeholders: string[] | undefined
            if (updates.subject || updates.body) {
                const currentTemplate = await this.getTemplate(userId, templateId)
                const subject = updates.subject || currentTemplate?.subject || ""
                const body = updates.body || currentTemplate?.body || ""
                placeholders = this.extractPlaceholders(subject + " " + body)
            }

            await updateDoc(doc(db, "templates", templateId), {
                ...updates,
                ...(placeholders && { placeholders }),
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating template:", error)
            throw new Error("Failed to update template")
        }
    }

    // Delete a template
    static async deleteTemplate(userId: string, templateId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "templates", templateId))
        } catch (error) {
            console.error("Error deleting template:", error)
            throw new Error("Failed to delete template")
        }
    }

    // Search templates by title or category
    static async searchTemplates(userId: string, searchTerm: string): Promise<EmailTemplate[]> {
        try {
            const templates = await this.getUserTemplates(userId)

            return templates.filter(
                (template) =>
                    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
            )
        } catch (error) {
            console.error("Error searching templates:", error)
            throw new Error("Failed to search templates")
        }
    }

    // Extract placeholders from text ({{placeholder}} format)
    private static extractPlaceholders(text: string): string[] {
        const placeholderRegex = /\{\{([^}]+)\}\}/g
        const placeholders: string[] = []
        let match

        while ((match = placeholderRegex.exec(text)) !== null) {
            const placeholder = match[1].trim()
            if (!placeholders.includes(placeholder)) {
                placeholders.push(placeholder)
            }
        }

        return placeholders
    }

    // Replace placeholders in text with actual values
    static replacePlaceholders(text: string, values: Record<string, string>): string {
        return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
            const key = placeholder.trim()
            return values[key] || match
        })
    }

    // Duplicate a template
    static async duplicateTemplate(userId: string, templateId: string): Promise<string> {
        try {
            const template = await this.getTemplate(userId, templateId)
            if (!template) {
                throw new Error("Template not found")
            }

            const duplicatedTemplate: TemplateFormData = {
                title: `${template.title} (Copy)`,
                category: template.category,
                subject: template.subject,
                body: template.body,
                type: template.type,
                tags: template.tags,
            }

            return await this.createTemplate(userId, duplicatedTemplate)
        } catch (error) {
            console.error("Error duplicating template:", error)
            throw new Error("Failed to duplicate template")
        }
    }
}
