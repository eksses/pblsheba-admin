import axios from 'axios';

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
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Admin SW Registered');

    const readyRegistration = await navigator.serviceWorker.ready;

    const subscription = await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

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

    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.user?.token;

    await axios.post(`http://${window.location.hostname}:5000/api/notifications/subscribe`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Admin Push subscription saved');
    return true;
  } catch (error) {
    console.error('Admin Push subscription failed:', error);
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
