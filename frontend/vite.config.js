import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Targets evergreen browsers (released 2021+) instead of the default
  // broader compatibility target, so the build skips legacy-syntax
  // transforms/polyfills that today's visitors never need.
  build: {
    target: 'es2020',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
