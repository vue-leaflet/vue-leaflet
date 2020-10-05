import commonjs from "rollup-plugin-commonjs";
import VuePlugin from "rollup-plugin-vue";
import babel from "@rollup/plugin-babel";

export default {
  input: "./src/lib.js",
  output: [
    {
      file: "dist/vue-leaflet.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/vue-leaflet.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/vue-leaflet.umd.js",
      format: "umd",
      name: "vue-leaflet",
      sourcemap: true,
    },
  ],
  plugins: [
    commonjs(),
    VuePlugin({
      css: false,
    }),
    babel({ babelHelpers: "runtime" }),
  ],
  external: ["vue", "leaflet"],
};
