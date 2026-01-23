import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/AFFiNE/**', '**/research/**'],
    },
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    entries: ['index.html'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
