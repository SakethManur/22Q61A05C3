import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    proxy: {
      '/evaluation-service': {
        target: 'http://20.244.56.144',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/evaluation-service/, '/evaluation-service')
      }
    }
  }
})
