import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Sistema de Gestão Escolar',
        short_name: 'SGE',
        description: 'Sistema completo de gestão escolar com notas, frequências e mais',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hora
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    host: true, // Permite acesso via IP local
    open: true,
  },
  build: {
    // Otimizações para reduzir uso de memória
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'utils-vendor': ['axios', 'date-fns', 'zustand'],
        },
      },
      // Ignorar warnings de sourcemaps ausentes
      onwarn(warning, warn) {
        // Ignorar warnings de sourcemaps do face-api.js
        if (warning.code === 'SOURCEMAP_ERROR' && warning.message.includes('face-api.js')) {
          return;
        }
        warn(warning);
      }
    },
    // Reduzir uso de memória durante build
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['face-api.js'], // Carregar face-api sob demanda
    esbuildOptions: {
      // Desabilitar sourcemaps no dev
      sourcemap: false,
      // Configuração de memória para esbuild
      logLevel: 'warning',
      // Reduzir uso de memória
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  },
  // Otimizações adicionais para reduzir uso de memória
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
  },
})
