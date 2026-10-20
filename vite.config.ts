import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera UM arquivo só (dist/index.html) que abre com dois cliques, sem internet e sem servidor.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { assetsInlineLimit: 100000000 },
});
