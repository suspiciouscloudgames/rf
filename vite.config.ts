import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Layers of Observation',
        short_name: 'Observation',
        description: 'A touch-based 3D observation interface.',
        theme_color: '#080b0c',
        background_color: '#080b0c',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        icons: [
          { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,webp,mp4,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true
      }
    })
  ],
  build: {
    target: 'es2020',
    sourcemap: true,
    chunkSizeWarningLimit: 950
  }
})
