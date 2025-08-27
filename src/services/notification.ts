// // services/notificationService.ts
// export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
//   if (!('Notification' in window)) {
//     console.warn('This browser does not support notifications');
//     return false;
//   }

//   if (Notification.permission === 'granted') {
//     return true;
//   }

//   const permission = await Notification.requestPermission();
//   return permission === 'granted';
// };


// // services/notificationService.ts
// export const showLocalNotification = (title: string, options?: NotificationOptions) => {
//   if (!('Notification' in window) || Notification.permission !== 'granted') {
//     return;
//   }

//   new Notification(title, {
//     icon: '/icon-192.png',
//     badge: '/icon-72.png',
//     ...options,
//   });
// };


export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission was denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static showLocalNotification(
    title: string, 
    options?: NotificationOptions & { data?: any }
  ): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    console.log("asdasd")
    const notification = new Notification(title, {
      // icon: '/icon-192.png',
      // badge: '/icon-72.png',
      // vibrate: [200, 100, 200], // vibration pattern for mobile
      ...options,
    });

    // Handle notification click
    notification.onclick = () => {
      notification.close();
      if (options?.data) {
        // You can handle navigation or other actions here
        console.log('Notification clicked with data:', options.data);
        window.focus();
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  static isSupported(): boolean {
    return 'Notification' in window;
  }
}