import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}).process
const requestedBase = runtimeProcess?.env?.VITE_BASE_PATH
const base = requestedBase
  ? `/${requestedBase.replace(/^\/+|\/+$/g, '')}/`
  : runtimeProcess?.env?.GITHUB_PAGES === 'true'
    ? '/ResonantField/'
    : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Entries from Here',
        short_name: 'Entries from Here',
        description: '터치 기반 3D 관찰 인터페이스',
        theme_color: '#080b0c',
        background_color: '#080b0c',
        display: 'standalone',
        orientation: 'landscape',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}assets/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}assets/icon-512.png`, sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,jpeg,png,webp,mp4,json,bin,glb,woff,woff2}'],
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
