import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api and /socket.io are proxied to the Express server,
// so the browser only ever talks to one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
});
