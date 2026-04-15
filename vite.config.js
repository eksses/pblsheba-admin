import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'admin-cloudinary-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
          {
            urlPattern: /\/api\/admin\/.*/i,
            handler: 'NetworkFirst', // Admins need fresh data, but fallback to cache if offline
            options: {
              cacheName: 'admin-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 Hours
              },
            },
          },
        ],
      },
      manifest: {
        name: 'PBL Sheba Admin Panel',
        short_name: 'Sheba Admin',
        description: 'Admin panel for PBL Sheba member management',
        theme_color: '#1e293b',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/app-icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/app-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/app-icon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
