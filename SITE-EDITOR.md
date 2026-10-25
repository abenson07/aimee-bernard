# Site editor (dashboard `/site`)

Aimee clicks a heading or photo on the live site, from inside the dashboard, and changes it. Changes save to a **draft**; **Publish** makes them live (within about a minute).

## How it fits together
- **Content:** one Sanity document per page (`site-page-home`, `site-page-educator`), each a list of named slots (a heading, a paragraph, or a photo). The slot list and today's content are in `studio/scripts/site-pages-catalog.ts`; load them with `studio/scripts/seed-site-pages.ts` (dry run by default, `--apply` to write; never overwrites a slot that already has content unless `--force`).
- **The site** (`web/src/lib/siteContent.ts`) reads a page's slots and falls back to the text or photo written in the page's code when a slot is empty or Sanity is down. Home and Educator are server-rendered and cached for a minute at the edge.
- **Editing:** the dashboard (`dashboard/app/(app)/site/`) shows the site in a frame. The frame's URL carries a short-lived signed token; only requests with a valid token get the draft and the edit hooks (`web/public/edit-mode.js`). Visitors never see either.
- **Draft and Publish:** edits go to the draft copy (`drafts.<id>`); Publish copies the draft over the live document and removes the draft; Discard deletes the draft.

## Settings (never commit values)
| Where | Name | What |
|---|---|---|
| Dashboard | `SITE_URL` | The live site's address (`http://localhost:4321` locally) |
| Dashboard | `SITE_PREVIEW_SECRET` | Long random string, **identical** in both apps |
| Site | `SITE_PREVIEW_SECRET` | Same string |
| Site | `DASHBOARD_ORIGIN` | The dashboard's address (`http://localhost:3000` locally); only this origin can talk to the edit hooks |
| Site | `SANITY_API_READ_TOKEN` | A Sanity "Viewer" token, server-side only, so previews can read drafts |

## Adding a page or a slot
1. Add the slot to `studio/scripts/site-pages-catalog.ts`; run the seed (it adds only what's missing).
2. On the page, read it with `site.text(key, fallback)` / `site.image(key, fallback)` and spread `{...site.edit(key, "text" | "image")}` on the element (see `web/src/pages/educator.astro`).
3. New page: add it to `SITE_PAGES` in `dashboard/lib/site.ts`, give the page `export const prerender = false`, call `getSitePage` and `site.applyCaching(Astro.response)`, and include the edit script at the bottom (`{site.preview && <script is:inline src="/edit-mode.js" data-origin={site.dashboardOrigin}></script>}`).
