import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // ES Module (for bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/reactive-dom.esm.js',
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
      file: 'dist/reactive-dom.umd.js',
      format: 'umd',
      name: 'ReactiveDOM',
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
      file: 'dist/reactive-dom.cjs.js',
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
