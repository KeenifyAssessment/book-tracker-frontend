import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // Automatically open browser
    cors: true
  },
  define: {
    // This helps with some environment variable edge cases
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
})