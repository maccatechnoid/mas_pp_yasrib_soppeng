import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/mas_pp_yasrib_soppeng/',
  plugins: [react()],
  server: {
    host: true, // expose to local network
    port: 5173,
  }
})
