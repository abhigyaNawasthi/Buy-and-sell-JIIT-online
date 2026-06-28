import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IP addresses
    strictPort: true,
    allowedHosts: true // Tells Vite to bypass host verification entirely
  }
})