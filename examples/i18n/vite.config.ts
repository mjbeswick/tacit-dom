import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 0,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  resolve: {
    alias: {
      'tacit-dom': '../../src/index.ts',
    },
  },
  esbuild: {
    target: 'esnext',
  },
});
