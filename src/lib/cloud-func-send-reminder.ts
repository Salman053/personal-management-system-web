// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as functionsV1 from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendReminderNotification = functions.firestore.onDocumentCreated(
  'reminders/{reminderId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;
    const reminder = snapshot.data();
    
    // If reminder is scheduled for future, we'll handle it differently
    if (reminder.status !== 'scheduled') return null;

    // Get user's device tokens
    const devicesSnapshot = await admin.firestore()
      .collection('devices')
      .where('userId', '==', reminder.userId)
      .get();

    if (devicesSnapshot.empty) return null;

    const tokens = devicesSnapshot.docs
      .map(doc => doc.data().fcmToken)
      .filter(token => token);

    if (tokens.length === 0) return null;

    // Send notification
    const message = {
      tokens,
      notification: {
        title: reminder.title || 'Reminder',
        body: reminder.description || 'You have a reminder due',
      },
      data: {
        reminderId: snapshot.id,
        type: reminder.type || 'general',
        documentId: reminder.documentId || '',
      },
    };

    try {
      await admin.messaging().sendEachForMulticast(message);
      // Update reminder status
      await snapshot.ref.update({ status: 'sent' });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
);

export const checkDueReminders = functionsV1.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const fiveMinutesFromNow = new Date(now.toDate().getTime() + 5 * 60 * 1000);

    const remindersRef = admin.firestore().collection('reminders');
    const dueReminders = await remindersRef
      .where('status', '==', 'scheduled')
      .where('schedule.dateTime', '<=', admin.firestore.Timestamp.fromDate(fiveMinutesFromNow))
      .get();

    for (const doc of dueReminders.docs) {
      const reminder = doc.data();

      // Get device tokens
      const devicesSnapshot = await admin.firestore()
        .collection('devices')
        .where('userId', '==', reminder.userId)
        .get();

      if (devicesSnapshot.empty) continue;

      const tokens = devicesSnapshot.docs
        .map(deviceDoc => deviceDoc.data().fcmToken)
        .filter(token => token);

      if (tokens.length === 0) continue;

      // Send notification
      const message = {
        tokens,
        notification: {
          title: reminder.title || 'Reminder',
          body: reminder.description || 'You have a reminder due',
        },
        data: {
          reminderId: doc.id,
          type: reminder.type || 'general',
          documentId: reminder.documentId || '',
        },
      };

      try {
        await admin.messaging().sendEachForMulticast(message);
        await doc.ref.update({ status: 'sent' });
      } catch (error) {
        console.error(`Error sending reminder ${doc.id}:`, error);
      }
    }
  });
