import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://*.spline.design https://unpkg.com",
        "worker-src 'self' blob: https://*.spline.design",
        "connect-src 'self' https://*.spline.design https://unpkg.com https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://*.spline.design",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "media-src 'self' blob:",
        "object-src 'none'",
      ].join('; '),
    },
  },
})
