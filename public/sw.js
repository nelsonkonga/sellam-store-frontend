self.addEventListener('install', function (event) {
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', function (event) {
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    event.waitUntil(
      Promise.all([
        self.registration.unregister(),
        caches.keys().then(function (names) {
          return Promise.all(names.map(function (name) { return caches.delete(name); }));
        })
      ])
    );
  }
});

// Permet au frontend de déclencher l'activation immédiate d'une nouvelle
// version en attente, depuis le bouton "Mettre à jour" du bandeau de mise
// à jour (voir useAppUpdate.js) -- plutôt que d'attendre la fermeture
// naturelle de tous les onglets ouverts.
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || "Nouvelle notification";
      const options = {
        body: data.body || "Vous avez une nouvelle notification.",
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Si la donnée n'est pas en JSON
      event.waitUntil(
        self.registration.showNotification("Notification", {
          body: event.data.text(),
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
      } else {
        clients.openWindow('/');
      }
    })
  );
});