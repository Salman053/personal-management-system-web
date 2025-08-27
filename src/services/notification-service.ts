import type { SubTask, Task, NotificationContact } from "@/types"

export class NotificationService {
  // Send WhatsApp message via WhatsApp Business API or third-party service
  static async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Using a WhatsApp API service like Twilio, WhatsApp Business API, or similar
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phone,
          message: message,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("WhatsApp send error:", error)
      return false
    }
  }

  // services/notification-service.ts
  static async sendEmail(
    to: string,
    subject: string,
    title: string,
    message: string,
    list?: string[],
    note?: string
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          title,
          intro: message,
          list: list || [], // ✅ use list instead of sections
          note: note,

        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Email send error:", error);
      return false;
    }
  }

  // Generate notification message for completed subtask
  static generateCompletionMessage(subtask: SubTask, task: Task, remainingSubtasks: SubTask[]): string {
    const completedTime = new Date().toLocaleString()
    const remainingCount = remainingSubtasks.length

    let message = `✅ Task Update!\n\n`
    message += `"${subtask.title}" has been completed at ${completedTime}\n`
    message += `Task: ${task.title}\n\n`

    if (remainingCount > 0) {
      message += `Remaining items (${remainingCount}):\n`
      remainingSubtasks.filter(s => !s.isCompleted).forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`
      })
    } else {
      message += `🎉 All items completed! Task "${task.title}" is now finished.`
    }

    return message
  }

  // Send notifications to all contacts
  static async notifyContacts(
    contacts: NotificationContact[],
    subtask: SubTask,
    task: Task,
    remainingSubtasks: SubTask[],
  ): Promise<void> {
    const message = this.generateCompletionMessage(subtask, task, remainingSubtasks)
    const subject = `Task Update: ${subtask.title} Completed`

    const notifications = contacts.map(async (contact) => {
      const promises = []

      // Send WhatsApp if phone number exists
      if (contact.phone) {
        promises.push(this.sendWhatsAppMessage(contact.phone, message))
      }

      // Send email if email exists
      // if (contact.email) {
      //   promises.push(this.sendEmail(contact.email, subject, message))
      // }

      return Promise.all(promises)
    })

    await Promise.all(notifications)
  }
}
