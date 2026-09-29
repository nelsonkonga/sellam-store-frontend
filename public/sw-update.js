// Importé par le service worker généré (vite-plugin-pwa).
// Le worker reste en attente jusqu'au clic sur « Mettre à jour » :
// ce message le fait prendre le contrôle tout de suite.
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
