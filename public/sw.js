const VERSION = 'v1.4';

const DB_NAME = 'push_debug_db';
const STORE_NAME = 'notification_logs';

const logPushEvent = async (data) => {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Keep only last 50 logs
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result > 50) {
        store.clear(); // Simple cleanup if it gets too large
      }
    };

    store.add({
      timestamp: Date.now(),
      title: data.title,
      body: data.body,
      raw: data.raw,
      receivedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[SW] Failed to log push event:', err);
  }
};

self.addEventListener('install', () => {
  console.log('SW installed', VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activated', VERSION);
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push Received', event);
  
  let title = 'PBL Sheba';
  let body = 'You have a new update';
  let pushData = null;

  try {
    if (event.data) {
      const textData = event.data.text();
      console.log('[SW] Raw Data:', textData);
      
      try {
        pushData = event.data.json();
        title = pushData.title || title;
        body = pushData.message || pushData.body || body;
      } catch (e) {
        console.warn('[SW] Data is not JSON, using text fallback');
        body = textData || body;
      }
    }
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
  }

  console.log('[SW] Showing notification:', title, body);

  const options = {
    body: body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: pushData?.data?.url || pushData?.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  };

  const logPromise = logPushEvent({ title, body, raw: event.data?.text() });

  const promiseChain = Promise.all([
    self.registration.showNotification(title, options),
    logPromise
  ]).catch(err => console.error('[SW] showNotification or log failed:', err));

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
