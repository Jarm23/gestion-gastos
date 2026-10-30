import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Redirige /api al backend de Spring Boot durante el desarrollo
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
