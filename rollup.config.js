// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

import pkg from "./package.json";

// TODO browserist prod dev
export default [
  {
    input: "src/index.js",
    output: {
      name: "Subway",
      file: pkg.browser,
      format: "iife"
    }
  },
  {
    input: "src/index.js",
    output: {
      name: "Subway",
      file: "dist/subway.min.js",
      format: "iife"
      //sourcemap: true,
    },
    plugins: [terser()]
  },

  {
    input: "src/index.js",
    output: {
      name: "Subway",
      file: "dist/subway.es5.js",
      format: "iife"
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      })
    ]
  },
  {
    input: "src/index.js",
    output: {
      name: "Subway",
      file: "dist/subway.es5.min.js",
      format: "iife"
      //sourcemap: true,
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      terser()
    ]
  }
];
