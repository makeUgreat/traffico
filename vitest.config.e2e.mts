import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  test: {
    globals: true,
    root: '.',
    include: ['test/**/*.e2e-spec.ts'],
  },
  plugins: [swc.vite()],
});
