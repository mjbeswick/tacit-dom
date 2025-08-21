import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 0,
    open: true,
  },
  build: {
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
});
