import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',          // Auto-update silently
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'NUVLYX POS',
        short_name: 'NUVLYX',
        description: 'Modern POS system for cafés and restaurants',
        theme_color: '#d4af37',            // Gold accent
        background_color: '#0f0f0f',       // Dark splash bg
        display: 'standalone',             // Fullscreen, no browser UI
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'        // Android adaptive icon
          }
        ]
      },
      workbox: {
        // Only cache static assets — NO data caching
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        
        // Don't cache API calls — always go to network
        navigateFallbackDenylist: [/^\/api/],
        
        // Cleanup old caches on update
        cleanupOutdatedCaches: true,
        
        // Increase cache size limit (3 MB default → 10 MB)
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      },
      devOptions: {
        enabled: false                     // Disable in dev (cleaner DX)
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  }
})