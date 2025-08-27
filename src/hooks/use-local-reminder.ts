// // hooks/useLocalReminders.ts
// import { useEffect, useCallback } from 'react';
// import { collection, query, where, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { showLocalNotification } from '@/services/notification';

// export const useLocalReminders = (userId: string) => {
//   const checkDueReminders = useCallback(() => {
//     const now = new Date();
//     const remindersRef = collection(db, 'reminders');
    
//     const q = query(
//       remindersRef,
//       where('userId', '==', userId),
//       where('status', '==', 'scheduled'),
//       where('schedule.dateTime', '<=', Timestamp.fromDate(now))
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       snapshot.docChanges().forEach((change) => {
//         if (change.type === 'added') {
//           const reminder = change.doc.data();
          
//           // Show local notification
//           showLocalNotification(reminder.title, {
//             body: reminder.description,
//             data: {
//               reminderId: change.doc.id,
//               type: reminder.type,
//               documentId: reminder.documentId,
//             },
//           });

//           // Mark as sent (optional)
//           updateDoc(change.doc.ref, { status: 'sent' });
//         }
//       });
//     });

//     return unsubscribe;
//   }, [userId]);

//   useEffect(() => {
//     if (!userId) return;
    
//     const unsubscribe = checkDueReminders();
//     return () => unsubscribe();
//   }, [userId, checkDueReminders]);
// };