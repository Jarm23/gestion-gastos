import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Redirige /api al backend de Spring Boot durante el desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        configure: (proxy) => {
          // Desde el móvil el navegador envía Origin con la IP del PC, y el backend solo
          // acepta localhost. Al pasar por este proxy la petición ya es del mismo origen.
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
