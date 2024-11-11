import { defineConfig } from 'tsup';

export default defineConfig({
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  clean: true,
  dts: {
    resolve: true,
    entry: './src/index.ts',
  },
});
