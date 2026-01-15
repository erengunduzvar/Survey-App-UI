import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // ÖNEMLİ: Eğer backend'inde @RequestMapping("/api") YOKSA
        // aşağıdaki satırı aktif etmelisin:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
});
