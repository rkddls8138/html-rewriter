import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'app-router': 'src/app-router/index.ts',
    'pages-router': 'src/pages-router/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: ['react', 'next'],
});
