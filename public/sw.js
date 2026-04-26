const VERSION = 'v1.6';

const DB_NAME = 'push_debug_db';
const STORE_NAME = 'notification_logs';

const logPushEvent = async (data) => {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('console_logs')) {
        db.createObjectStore('console_logs', { keyPath: 'id', autoIncrement: true });
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
      console.log('[SW] Push Data Received:', textData);
      
      try {
        pushData = event.data.json();
        console.log('[SW] JSON Payload:', pushData);
        
        const displayData = pushData.notification || pushData;
        title = displayData.title || title;
        body = displayData.message || displayData.body || body;
      } catch (e) {
        console.warn('[SW] Push data is not JSON, using text fallback');
        body = textData || body;
      }
    } else {
      console.warn('[SW] Push event received but no data attached');
    }
  } catch (err) {
    console.error('[SW] Error processing push event:', err);
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

  const logPromise = logPushEvent({ title, body, raw: pushData ? JSON.stringify(pushData) : 'non-json data' });

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
