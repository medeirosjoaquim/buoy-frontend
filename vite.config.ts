import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Match tsconfig baseUrl: "./src"
      assets: path.resolve(__dirname, "./src/assets"),
      components: path.resolve(__dirname, "./src/components"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      intl: path.resolve(__dirname, "./src/intl"),
      pages: path.resolve(__dirname, "./src/pages"),
      services: path.resolve(__dirname, "./src/services"),
      store: path.resolve(__dirname, "./src/store"),
      theme: path.resolve(__dirname, "./src/theme"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
});
