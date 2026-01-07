/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
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
    // Generate sourcemaps only when SOURCEMAP env var is set (for debugging production issues)
    sourcemap: !!process.env.SOURCEMAP,
    // Ant Design UI framework is ~1.1MB minified; set limit accordingly
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Ant Design (largest dep) - split for better caching
            if (
              id.includes("/antd/") ||
              id.includes("/@ant-design/") ||
              id.includes("/rc-") ||
              id.includes("/@rc-component/")
            ) {
              return "vendor-antd";
            }
          }
        },
      },
    },
  },
});
