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
  console.log('Push Event Triggered:', event);
  
  let title = 'PBL Sheba';
  let body = 'You have a new update';
  let pushData = null;

  if (event.data) {
    try {
      pushData = event.data.json();
      title = pushData.title || title;
      body = pushData.message || pushData.body || body;
    } catch (e) {
      body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(title, {
    body: body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: pushData?.data?.url || pushData?.url || '/'
    }
  });

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
