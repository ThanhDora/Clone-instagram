import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["tslib", "@radix-ui/react-dialog"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-avatar",
            "@radix-ui/react-scroll-area",
          ],
          "form-vendor": [
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
          ],
          "icons-vendor": ["lucide-react", "react-icons"],
          "utils-vendor": ["axios", "socket.io-client", "clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
