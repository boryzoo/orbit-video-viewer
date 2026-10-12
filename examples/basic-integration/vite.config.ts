import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
});
