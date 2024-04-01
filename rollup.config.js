import terser from '@rollup/plugin-terser';

import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

function pgl(plugins = []) {
  return [
    ...plugins
  ];
}

const umdDist = 'dist/object-diagram-js-differ.js';

export default [

  // browser-friendly UMD build
  {
    input: 'lib/index.js',
    output: {
      name: 'odDiff',
      file: umdDist.replace(/\.js$/, '.min.js'),
      format: 'umd',
    },
    plugins: pgl([
      resolve(),
      terser()
    ]),
  },
  {
    input: 'lib/index.js',
    output: {
      name: 'odDiff',
      file: umdDist,
      format: 'umd',
    },
    plugins: pgl([
      resolve(),
    ]),
  },
  {
    input: 'lib/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    external: [
      'min-dash',
      'jsondiffpatch'
    ],
    plugins: pgl([
      resolve(),
    ]),
  }
];