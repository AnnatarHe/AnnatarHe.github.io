import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://annatarhe.github.io",

  integrations: [mdx(), react(), sitemap()],

  markdown: {
    shikiConfig: {
      theme: "dark-plus",
      wrap: true,
    },
  },

  build: {
    assets: "assets",
  },

  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },
});
