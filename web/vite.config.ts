import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { apiProxyPlugin } from "./vite-plugin-api-proxy";
import { hlsProxyPlugin } from "./vite-plugin-hls-proxy";

export default defineConfig({
  plugins: [react(), apiProxyPlugin(), hlsProxyPlugin()],
  server: { port: 5173, open: true },
  preview: { port: 4173 },
});
