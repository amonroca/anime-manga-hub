import { watch } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        search: resolve(__dirname, "src/search.html"),
        watchlist: resolve(__dirname, "src/watchlist.html"),
        favorites: resolve(__dirname, "src/favorites.html"),
        episodes: resolve(__dirname, "src/episodes.html"),
      },
    },
  },
});