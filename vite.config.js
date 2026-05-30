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
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
})
