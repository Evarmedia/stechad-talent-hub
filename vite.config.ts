import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::", // Allows connection from all network interfaces
    port: 8080,
    allowedHosts: [
      "stechad-talent-hub.onrender.com", // Add this host
      "stechad-talent-hub-ps0n.onrender.com",
    ],
  },
  plugins: [react()],
  build: { rollupOptions: { input: { customer: path.resolve(__dirname, "index.html"), platform: path.resolve(__dirname, "platform-admin.html") } } },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
