const path = require("path");
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib.ts"),
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
