import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/assets/app.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    postcss({ extract: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    production && terser()
  ]
};
