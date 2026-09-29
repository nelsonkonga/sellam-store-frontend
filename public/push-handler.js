self.addEventListener("push", function (event) {
  let title = "Sellam";
  let body = "Vous avez une nouvelle notification.";
  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch (e) {
      body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windowClients) {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});
