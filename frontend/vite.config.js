import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Certificado local compartido con Spring Boot (carpeta certs/ en la raíz, fuera de git)
const certDir = new URL('../certs/', import.meta.url)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: readFileSync(new URL('localhost-key.pem', certDir)),
      cert: readFileSync(new URL('localhost.pem', certDir)),
    },
    // Redirige /api al backend de Spring Boot durante el desarrollo
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        // El certificado es autofirmado: el proxy no debe rechazarlo
        secure: false,
        configure: (proxy) => {
          // Desde el móvil el navegador envía Origin con la IP del PC, y el backend solo
          // acepta localhost. Al pasar por este proxy la petición ya es del mismo origen.
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
