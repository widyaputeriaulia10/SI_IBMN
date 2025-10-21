import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // agar bisa diakses dari luar (0.0.0.0)
    port: 5173, // sesuaikan
    // Izinkan host dari Cloudflare Tunnel
    // Coba wildcard dulu:
    // allowedHosts: [".trycloudflare.com"],
    // // Kalau versimu tidak terima wildcard, tulis domain persis:
    // // allowedHosts: ['focused-game-nightlife-untitled.trycloudflare.com'],

    // // HMR lewat HTTPS/tunnel (sering perlu agar live reload jalan mulus):

    // hmr: {
    //   protocol: "wss",
    //   host: "https://electric-epa-tomorrow-peninsula.trycloudflare.com/", // ganti sesuai URL yang keluar
    //   clientPort: 443,
    // },
    proxy: {
      "/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
