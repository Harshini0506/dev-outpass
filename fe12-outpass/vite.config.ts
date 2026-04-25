import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [
      '127.0.0.1',
      'localhost',
      'dev-outpass.vishwavasu.com',
      'dev-outpass.vjstartup.com'
    ],
    proxy: {
      // AUTH SERVER → port 2999
      '/be/auth': {
        target: 'http://localhost:2999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/be/, '')
      },

      '/be/check-auth': {
        target: 'http://localhost:2999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/be/, '')
      },

      '/be/logout': {
        target: 'http://localhost:2999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/be/, '')
      },

      // MAIN BACKEND → port 6112
      '/be': {
        target: 'http://localhost:6112',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/be/, '/api')
      }
    }
  }
})
