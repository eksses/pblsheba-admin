// Force activate immediately — don't wait for old tabs to close
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'PBL Sheba', body: event.data ? event.data.text() : 'New notification' };
  }

  const title = data.title || 'PBL Sheba';
  const options = {
    body: data.body || 'You have a new update',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    tag: 'pbl-notification-' + Date.now(),
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
