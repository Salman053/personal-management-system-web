import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export class FCMService {
  private static messaging: Messaging | null = null;
  private static vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

  static async initialize(): Promise<boolean> {
    try {
      this.messaging = await getMessagingInstance();
      if (!this.messaging) return false;

      await this.requestPermission();
      const token = await this.getCurrentToken();
      
      if (token) {
        await this.saveTokenToFirestore(token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('FCM initialization failed:', error);
      return false;
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.messaging) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return true;
      } else {
        console.warn('Notification permission not granted.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async getCurrentToken(): Promise<string | null> {
    if (!this.messaging || !this.vapidKey) return null;

    try {
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async saveTokenToFirestore(token: string): Promise<void> {
    try {
      const auth = await import('@/lib/firebase').then(mod => mod.auth);
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('No user logged in, cannot save FCM token');
        return;
      }

      // Check if token already exists
      const devicesRef = collection(db, 'devices');
      const q = query(
        devicesRef, 
        where('userId', '==', user.uid), 
        where('fcmToken', '==', token)
      );
      
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Save new token
        await addDoc(devicesRef, {
          userId: user.uid,
          fcmToken: token,
          createdAt: new Date(),
          platform: 'web',
          userAgent: navigator.userAgent,
        });
        console.log('FCM token saved to Firestore');
      }
    } catch (error) {
      console.error('Error saving FCM token to Firestore:', error);
    }
  }

  static onMessage(callback: (payload: any) => void): () => void {
    if (!this.messaging) {
      return () => {};
    }

    return onMessage(this.messaging, callback);
  }

  static async deleteToken(): Promise<void> {
    if (!this.messaging) return;

    try {
      const token = await this.getCurrentToken();
      if (token) {
        // You might want to also remove from Firestore
        console.log('FCM token deleted (client-side)');
      }
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }
}