import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon-32.png"],
      manifest: {
        name: "קריית התקשוב — צ'אט בוט",
        short_name: "קריית התקשוב",
        description: "עוזר דיגיטלי לשאלות על הנהלים והמקום בקריית התקשוב.",
        lang: "he",
        dir: "rtl",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#142030",
        theme_color: "#1b2a3d",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        // The chat API is dynamic (POST) — never cache it; always hit network.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        // Keep the SW OFF in `npm run dev` — otherwise it precaches the app
        // shell and serves stale content while you edit (fights HMR). The PWA
        // is fully active in production builds and `npm run preview`.
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
