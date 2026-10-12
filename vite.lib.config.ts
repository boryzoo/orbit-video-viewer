import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    target: 'es2022',
    outDir: 'dist/library',
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./src/library/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'orbit-viewer.js',
    },
    rollupOptions: {
      external: ['mp4box'],
    },
  },
});
