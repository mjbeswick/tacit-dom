import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 0,
    open: true,
  },
  preview: {
    port: 0,
  },
  esbuild: {
    target: 'esnext',
  },
});
