import axiosClient from '../api/axiosClient';

const VAPID_PUBLIC_KEY = 'BGJBhJEhNlojxGRksjriJrIgH7-BCs0q4D7_rthm5AKP3tJnjBpU46mIiqZ87UNQSvcpuIlGb51ouqHrgvAOMY0';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeAdminToPush = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');

    const readyRegistration = await navigator.serviceWorker.ready;

    let subscription = await readyRegistration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    const subObj = subscription.toJSON();
    const payload = {
      subscription: {
        endpoint: subObj.endpoint,
        keys: {
          p256dh: subObj.keys.p256dh,
          auth: subObj.keys.auth
        }
      }
    };

    await axiosClient.post('/notifications/subscribe', payload);
    console.log('Admin push subscription saved');
    return true;
  } catch (error) {
    console.error('Admin push subscription failed:', error);
    return false;
  }
};

export const requestAdminNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') {
    return await subscribeAdminToPush();
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await subscribeAdminToPush();
    }
  }
  return false;
};
