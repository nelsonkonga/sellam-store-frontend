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
