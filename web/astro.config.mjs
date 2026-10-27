// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import { loadEnv } from "vite";
import vercel from "@astrojs/vercel";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SANITY_STUDIO_URL } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export default defineConfig({
  site: SITE_URL,

  integrations: [
    react(),
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: "2026-08-14",
      useCdn: false,
      // Invisible markers in fetched strings let Presentation map a click to
      // its field. Only emitted when a query asks for stega (see loadQuery).
      stega: { studioUrl: PUBLIC_SANITY_STUDIO_URL ?? "http://localhost:3333" },
    }),
  ],

  // Decision #7: formerly `output: 'hybrid'` (Astro 4). In Astro 5+ that mode
  // merged into `static` — prerendered HTML by default, with preview/draft
  // routes later opted into SSR via `export const prerender = false`.
  output: "static",
  adapter: vercel(),
});
