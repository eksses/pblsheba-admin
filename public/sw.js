const VERSION = 'v1.1';

self.addEventListener('install', () => {
  console.log('SW installed', VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activated', VERSION);
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push received', event);
  let data = {};

  try {
    data = event.data.json();
  } catch (err) {
    data = { 
      title: 'PBL Sheba Update', 
      message: event.data ? event.data.text() : 'New notification received' 
    };
  }

  const options = {
    body: data.message || data.body || 'You have a new update',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PBL Sheba', options)
  );
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
