import { resolve } from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // Enable TypeScript in Svelte components
        enableSourcemap: true,
        // Enable strict mode
        immutable: true,
        // Enable type checking in Svelte components
        dev: process.env.NODE_ENV !== "production",
      },
    }),
  ],
  root: "web",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    sourcemap: true,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["svelte", "ethers"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./web"),
    },
    extensions: [".ts", ".tsx", ".js", ".mjs", ".svelte"],
  },
  optimizeDeps: {
    include: ["svelte", "ethers"],
  },
});
