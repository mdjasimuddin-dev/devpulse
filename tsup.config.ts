import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], // file name
  format: ['esm'], // Keep this as ESM
  target: 'esnext', // matching the tconfig.json file target
  outDir: './dist', // matching the tconfig.json file target
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,

  // Add this banner to shim require() for CJS dependencies
  banner: {
    js: `import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  `,
  },
});
