import { toast } from "sonner";
import { NotificationService } from "@/services/notification-service";
import { SubTask } from "@/types"; // adjust import

type NotificationType = "whatsapp" | "email" | "share";

interface NotificationOptions {
    type: NotificationType;
    contacts: { email?: string; phone?: string }[];
    subject?: string; // email subject
    title?: string;   // share title
    message: string;  // main body text
    list?: string[];  // for email task items
    note?: string;  // for email task items
}

export const sendNotification = async (options: NotificationOptions) => {
    const { type, contacts, subject, title, message, list, note } = options;

    try {
        if (type === "whatsapp") {
            const phoneContacts = contacts.filter((c) => c.phone?.trim());
            if (phoneContacts.length === 0) {
                toast.error("No WhatsApp contacts configured");
                return;
            }

            for (const contact of phoneContacts) {
                await NotificationService.sendWhatsAppMessage(contact.phone!, message);
            }
            toast.success(`WhatsApp notification sent to ${phoneContacts.length} contact(s)`);
        }

        if (type === "email") {
            const emailContacts = contacts.filter((c) => c.email?.trim());
            if (emailContacts.length === 0) {
                toast.error("No email contacts configured");
                return;
            }

            for (const contact of emailContacts) {
                await NotificationService.sendEmail(
                    contact.email!,
                    subject || "Notification",
                    title || "Update",
                    message,
                    list || [],
                    note || ""
                );
            }
            toast.success(`Email sent to ${emailContacts.length} contact(s)`);
        }

        if (type === "share") {
            const shareTitle = title || "Notification";
            if (navigator.share) {
                await navigator.share({ text: message, title: shareTitle });
                toast.success("Shared successfully");
            } else {
                await navigator.clipboard.writeText(message);
                toast.success("Copied to clipboard");
            }
        }
    } catch (error: any) {
        toast.error(`Failed to send ${type}: ${error.message}`);
    }
};
