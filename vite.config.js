import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  // `vercel dev` starts the dev server on the port it passes in $PORT and proxies to
  // it; without this Vite stays on 5173 and every page returns 500 locally.
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {},
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
