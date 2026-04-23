import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [
      '127.0.0.1',
      'outpass.vjstartup.com',
      'dev-outpass.vjstartup.com'
    ],

  },
})
