import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.png'],
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
