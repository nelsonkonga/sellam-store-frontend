import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./polyfills.js";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// A development tab must never be served by a production service worker.
// Old service workers are removed once so normal browser windows recover from
// stale cached bundles without losing authentication or local business data.
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames
        .filter((cacheName) => cacheName.startsWith('workbox-') || cacheName.startsWith('sellam-assets-cache'))
        .forEach((cacheName) => caches.delete(cacheName));
    });
  }
} else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').then(
    (registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    (err) => {
      console.log('ServiceWorker registration failed: ', err);
    }
  );
}
