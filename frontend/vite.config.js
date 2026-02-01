import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      '.ngrok-free.app', // allow any ngrok subdomain
      'localhost',
      '127.0.0.1'
    ]
  }
})
