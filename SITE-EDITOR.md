# Site editor (dashboard `/site`)

Aimee clicks any text or photo on the live site, from inside the dashboard, and changes it. Changes save to a **draft**; **Publish** makes them live (within about a minute).

**Layout** (copied from Stacki's editor, https://github.com/flowtricks/stacki, MIT; light, in Aimee's blue #6aa8ff; `dashboard/app/(app)/site/studio.tsx` + `studio.css`, icons in `site/icons.tsx`):
- Title bar: account menu (Bot content gaps, questionnaire, sign out), page switcher, link to the live page (green dot = live, amber = draft changes), Discard and Publish.
- Icon rail with four panels (click the open one to fold it away): **Pages**; **Navigator** (every section of the page and the editable things in it; hover or click a row to find it on the page); **Content log** (the dashboard's item list covers the page, filtered by kind); **Photos** (the library; select a photo on the page, then pick one here to swap it in).
- The page in the middle, with breadcrumbs and Desktop / Tablet / Phone widths. Hover and selection boxes with a name tag are drawn by `web/public/edit-mode.js`.
- Right panel: whatever is selected, as labelled fields (text; or photo, Change photo and description), plus anything that belongs with it (the hover photo and speech bubble behind a Home hero word). Text can also be typed straight onto the page (Enter or click away saves; Esc cancels).

**Items from the content log** (awards, press cards, course tiles, logos; purple outline) open in a window instead: awards and press use the content log's own item window, course tiles and logos have their own (`site/doc-modals.tsx`). These save straight to the live site, like everything in the content log. A course tile's years and courses are still edited in Studio.

## How it fits together
- **Content:** one Sanity document per page (`site-page-home`, `site-page-educator`), each a list of named slots (a heading, a paragraph, or a photo). Text slots are added the first time a piece of text is edited (the page's code holds the original wording). The photo slots and today's photos are in `studio/scripts/site-pages-catalog.ts`; load them with `studio/scripts/seed-site-pages.ts` (dry run by default, `--apply` to write; never overwrites a slot that already has content unless `--force`).
- **The site** (`web/src/lib/siteContent.ts`) reads a page's slots and falls back to the text or photo written in the page's code when a slot is empty or Sanity is down. Home and Educator are server-rendered and cached for a minute at the edge.
- **Editing:** the dashboard (`dashboard/app/(app)/site/`) shows the site in a frame. The frame's URL carries a short-lived signed token; only requests with a valid token get the draft and the edit hooks (`web/public/edit-mode.js`). Visitors never see either.
- **Draft and Publish:** edits go to the draft copy (`drafts.<id>`); Publish copies the draft over the live document and removes the draft; Discard deletes the draft.

## Settings (never commit values)
| Where | Name | What |
|---|---|---|
| Dashboard | `SITE_URL` | The live site's address (`http://localhost:4321` locally) |
| Dashboard | `SITE_PREVIEW_SECRET` | Long random string, **identical** in both apps |
| Site | `SITE_PREVIEW_SECRET` | Same string |
| Site | `DASHBOARD_ORIGIN` | The dashboard's address (`http://localhost:3000` locally; several can be listed, comma separated); only these origins can talk to the edit hooks. If clicking a photo or item does nothing in the editor, this is the first thing to check |
| Site | `SANITY_API_READ_TOKEN` | A Sanity "Viewer" token, server-side only, so previews can read drafts |

## Adding a page or a slot
1. Text: on the page, read it with `site.text(key, fallback)` and spread `{...site.edit(key)}` on the element that holds only that text (wrap it in a `<span>` if it shares an element with other markup). Nothing else is needed. Use `site.lines()` for text with line breaks; pass extra slot keys as the third argument of `edit()` to show them in the right panel too.
2. Photo: add the slot to `studio/scripts/site-pages-catalog.ts` and run the seed (it adds only what's missing), then use `site.image(key, fallback)` with `{...site.edit(key, "image")}` on the photo's wrapper.
3. A Sanity item: put `data-doc={_id}`, `data-doc-type` (`contentItem`, `courseGroup` or `publication`) and `data-doc-label` on its element. A new type needs a case in `loadDoc` (`site/actions.ts`) and a window.
4. New page: add it to `SITE_PAGES` in `dashboard/lib/site.ts`, give the page `export const prerender = false`, call `getSitePage` and `site.applyCaching(Astro.response)`, and include the edit script at the bottom (`{site.preview && <script is:inline src="/edit-mode.js" data-origin={site.dashboardOrigin}></script>}`).
