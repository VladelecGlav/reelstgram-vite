import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
});