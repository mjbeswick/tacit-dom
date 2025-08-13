import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // ES Module (for bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/thorix.esm.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
      }),
      terser(),
    ],
    external: [],
  },
  // UMD (for browsers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/thorix.umd.js',
      format: 'umd',
      name: 'Thorix',
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      terser(),
    ],
    external: [],
  },
  // CommonJS (for Node.js)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/thorix.cjs.js',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      terser(),
    ],
    external: [],
  },
];
