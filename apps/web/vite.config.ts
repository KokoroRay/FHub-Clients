import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': { target: 'http://localhost:5111', changeOrigin: true },
      '/api/identity': { target: 'http://localhost:5111', changeOrigin: true },
      '/api/users': { target: 'http://localhost:5111', changeOrigin: true },
      '/api/campuses': { target: 'http://localhost:5255', changeOrigin: true },
      '/api/majors': { target: 'http://localhost:5255', changeOrigin: true },
      '/api/course-nodes': { target: 'http://localhost:5255', changeOrigin: true },
      '/api/dashboard': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/governance-accounts': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/support-tickets': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/manual-verifications': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/audit-logs': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/system-logs': { target: 'http://localhost:5249', changeOrigin: true },
      '/api/reputation': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/admin/reputation': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/badges': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/admin/badges': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/communication': { target: 'http://localhost:8082', changeOrigin: true },
    }
  }
})

