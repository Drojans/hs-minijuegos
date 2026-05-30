import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Eliminar console.log/warn en producción
    drop: ['console', 'debugger'],
    // Avisar si algún chunk supera 600 KB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separar vendors de React del código de la app
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
})
