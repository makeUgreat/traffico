import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  test: {
    globals: true,
    root: '.',
    include: ['test/**/*.spec.ts'],
  },
  plugins: [swc.vite()],
});
