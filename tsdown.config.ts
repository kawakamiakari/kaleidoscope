import { defineConfig } from 'tsdown';

export default defineConfig([
  // npm: ESM / CommonJS + type definitions
  {
    entry: 'src/kaleidoscope.ts',
    format: ['esm', 'cjs'],
    platform: 'browser',
    target: 'es2018',
    dts: { cjsDefault: true },
  },
  // <script> tag / CDN: exposes window.Kaleidoscope
  {
    entry: 'src/kaleidoscope.ts',
    format: 'iife',
    globalName: 'Kaleidoscope',
    platform: 'browser',
    target: 'es2018',
    minify: true,
    outputOptions: { entryFileNames: '[name].min.js' },
  },
]);
