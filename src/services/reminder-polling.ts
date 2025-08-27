import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  Timestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationService } from '@/services/notification';

export class ReminderPollingService {
  private static pollInterval: NodeJS.Timeout | null = null;
  private static realtimeUnsubscribe: (() => void) | null = null;

  // Start polling for reminders
  static startPolling(userId: string, pollIntervalMs: number = 30000): void {
    if (!userId) {
      console.error('User ID is required for reminder polling');
      return;
    }

    // Request notification permission
    NotificationService.requestPermission();

    // Initial check
    this.checkDueReminders(userId);

    // Set up polling interval
    this.pollInterval = setInterval(() => {
      this.checkDueReminders(userId);
    }, pollIntervalMs);

    console.log(`Reminder polling started for user ${userId}`);
  }

  // Stop polling
  static stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.realtimeUnsubscribe) {
      this.realtimeUnsubscribe();
      this.realtimeUnsubscribe = null;
    }

    console.log('Reminder polling stopped');
  }

  // Check for due reminders
  static async checkDueReminders(userId: string): Promise<void> {
    try {
      const now = new Date();
      const remindersRef = collection(db, 'reminders');
      
      const q = query(
        remindersRef,
        where('userId', '==', userId),
        where('status', '==', 'scheduled'),
        where('schedule.dateTime', '<=', Timestamp.fromDate(now))
      );

      const snapshot = await getDocs(q);
      console.log(snapshot)
      if (snapshot.empty) {
        return;
      }


      console.log(`Found ${snapshot.size} due reminders`);

      // Process each due reminder
      for (const doc of snapshot.docs) {
        await this.processDueReminder(doc);
      }

    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  }

  // Process a single due reminder
  private static async processDueReminder(doc: any): Promise<void> {
    try {
      const reminder = doc.data();
      
      // Show browser notification
      NotificationService.showLocalNotification(reminder.title, {
        body: reminder.description || 'You have a reminder due!',
        tag: doc.id, // Group similar notifications
        data: {
          reminderId: doc.id,
          type: reminder.type,
          documentId: reminder.documentId,
          priority: reminder.priority,
        },
        requireInteraction: reminder.priority === 'High', // High priority stays until clicked
      });

      // Mark as sent in Firestore
      await updateDoc(doc.ref, { 
        status: 'sent',
        updatedAt: Timestamp.now() 
      });

      console.log(`Processed reminder: ${reminder.title}`);

    } catch (error) {
      console.error(`Error processing reminder ${doc.id}:`, error);
    }
  }

  // Optional: Real-time listener for immediate reminders
  static startRealtimeListener(userId: string): void {
    if (!userId) return;

    const remindersRef = collection(db, 'reminders');
    const q = query(
      remindersRef,
      where('userId', '==', userId),
      where('status', '==', 'scheduled')
    );

    this.realtimeUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const reminder = change.doc.data();
          const now = new Date();
          const reminderTime = reminder.schedule.dateTime.toDate();

          // Check if reminder is due now (within 1 minute)
          if (reminderTime <= now && reminderTime >= new Date(now.getTime() - 60000)) {
            this.processDueReminder(change.doc);
          }
        }
      });
    });
  }
}