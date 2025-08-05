import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: '.',
  build: {
    outDir: '../dist/examples',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        counter: resolve(__dirname, 'counter/index.html'),
        'random-generator': resolve(__dirname, 'random-generator/index.html'),
        debug: resolve(__dirname, 'debug/index.html'),
        router: resolve(__dirname, 'router/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
