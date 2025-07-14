import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      host: '127.0.0.1'
    },
    watch: {
      usePolling: false,
      interval: 1000
    },
    fs: {
      strict: false
    }
  },
  define: {
    global: 'globalThis',
    __DEV__: true, // Désactiver le service worker en dev
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mapbox: ['mapbox-gl'],
          utils: ['axios', 'react-router-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react-map-gl'],
    exclude: ['@mapbox/node-pre-gyp']
  },
  preview: {
    host: '127.0.0.1',
    port: 5173
  }
})
