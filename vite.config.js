import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' : le nouveau service worker reste en attente. Le bouton
      // « Mettre à jour » lui envoie SKIP_WAITING (voir public/sw-update.js).
      // 'autoUpdate' forçait skipWaiting et le clic n'avait plus rien à activer.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['favicon.ico', 'robots.txt', 'sellam-logo.png', 'icon-192.png', 'icon-256.png', 'icon-384.png', 'icon-512.png', 'icon-maskable.png'],
      manifest: {
        id: '/',
        name: 'Sellam',
        short_name: 'Sellam',
        description: 'Gérez vos boutiques, ventes et bilans en toute simplicité.',
        theme_color: '#006547',
        background_color: '#f1fcf5',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        // Screenshots: uncomment when images are added to /public/screenshots/
        // screenshots: [
        //   {
        //     src: '/screenshots/sellam-wide.png',
        //     sizes: '1280x720',
        //     type: 'image/png',
        //     form_factor: 'wide',
        //     label: 'Sellam dashboard desktop'
        //   },
        //   {
        //     src: '/screenshots/sellam-mobile.png',
        //     sizes: '390x844',
        //     type: 'image/png',
        //     label: 'Sellam dashboard mobile'
        //   }
        // ],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        importScripts: ["push-handler.js", "sw-update.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && /\/api\//i.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sellam-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          },
          {
            // Les navigations (dont /login) passent par le précache de index.html.
            // Les inclure ici renvoyait la 404 réseau de Vercel telle quelle.
            urlPattern: ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sellam-assets-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
server: {
    allowedHosts: ['.ngrok-free.dev'],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
});
