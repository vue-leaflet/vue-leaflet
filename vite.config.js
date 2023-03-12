import vue from "@vitejs/plugin-vue";
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      "@src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/lib.ts", import.meta.url)),
      formats: ["es", "cjs", "umd"],
      name: "vue-leaflet",
      fileName: (fmt) => `vue-leaflet.${fmt}.js`,
    },
    rollupOptions: {
      external: ["vue", "leaflet", /^leaflet\/.*/],
      output: {
        // Global variables for use in the UMD build
        globals: {
          vue: "Vue",
          leaflet: "L",
        },
      },
    },
  },
});
