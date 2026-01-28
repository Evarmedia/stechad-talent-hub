import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Allows connection from all network interfaces
    port: 8080,
    allowedHosts: [
      "stechad-talent-hub.onrender.com", // Add this host
    ],
  },
  plugins: [react(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });

