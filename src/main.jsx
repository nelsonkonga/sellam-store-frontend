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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(
    (registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    (err) => {
      console.log('ServiceWorker registration failed: ', err);
    }
  );
}
