// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

import vercel from "@astrojs/vercel";

export default defineConfig({
  site: SITE_URL,

  integrations: [
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
  ],

  // Decision #7: formerly `output: 'hybrid'` (Astro 4). In Astro 5+ that mode
  // merged into `static` — prerendered HTML by default, with preview/draft
  // routes later opted into SSR via `export const prerender = false`.
  output: "static",
  adapter: vercel(),
});