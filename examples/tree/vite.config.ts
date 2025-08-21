import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 0,
    open: true,
  },
  esbuild: {
    target: 'esnext',
  },
});
