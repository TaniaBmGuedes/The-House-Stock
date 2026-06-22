import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O frontend corre no Vite (5173) e a API no servidor de dev (3001).
// `npm run dev` arranca os dois; o proxy encaminha /api para a API.
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true expõe o servidor na rede local (LAN), para abrir no telemóvel
    // via http://<IP-do-Mac>:5173 (Mac e telemóvel no mesmo Wi-Fi).
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
