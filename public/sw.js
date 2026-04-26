const VERSION = 'v1.2';

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

  const promiseChain = self.registration.showNotification(title, options)
    .catch(err => console.error('[SW] showNotification failed:', err));

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
