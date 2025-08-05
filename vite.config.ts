import { defineConfig } from 'vite';

export default defineConfig({
  root: 'examples',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: '../dist-dev',
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
