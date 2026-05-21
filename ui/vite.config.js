import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/save-env': 'http://localhost:3000',
      '/run-stream': 'http://localhost:3000',
      '/stop': 'http://localhost:3000',
      '/env': 'http://localhost:3000',
    }
  }
})
