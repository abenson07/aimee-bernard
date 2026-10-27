# Site editor (dashboard `/site`)

Aimee clicks any text or photo on the live site, from inside the dashboard, and changes it. Changes save to a **draft**; **Publish** makes them live (within about a minute).

**Layout** (copied from Stacki's editor, https://github.com/flowtricks/stacki, MIT; light, in Aimee's blue #6aa8ff; `dashboard/app/(app)/site/studio.tsx` + `studio.css`, icons in `site/icons.tsx`):
- Title bar: account menu (full-page content log at `/content`, questionnaire, sign out), save status with a live/draft dot, Discard and Publish. Discard asks in the app's own dialog.
- Icon rail with three panels (closed by default so the page gets the full width; click the open one's icon to fold it away): **Pages**; **Content log** (the dashboard's item list covers the page, filtered by kind); **Photos** (the library; select a photo on the page, then pick one here to swap it in).
- Above the page: the page dropdown (Home, Educator, Communicator, Immunologist, Contact), a link to the live page, and Desktop / Tablet / Phone widths. Hover and selection boxes with a name tag are drawn by `web/public/edit-mode.js`.
- Right panel: whatever is selected.
  - **Text or a photo on the page** (blue): labelled fields. A photo has a full-width Change photo button and a Description (with an info tip on why it's needed). Text can also be typed straight onto the page (Enter or click away saves; Esc cancels).
  - **An item from Sanity** (purple: awards, press and feature cards, papers, courses, logos): its edit form, the same one the content log uses, shown in the panel. These save straight to the live site, like everything in the content log.
  - **A course tile** also has "Show this tile's panel on the page", which opens the sheet that slides up from the tile; a course clicked inside the sheet edits in the panel. A tile's years and course lists are still edited in Studio.

## How it fits together
- **Content:** one Sanity document per page (`site-page-home`, `-educator`, `-communicator`, `-immunologist`, `-contact`), each a list of named slots (a heading, a paragraph, or a photo). Text slots, photo slots and the page document itself are added the first time something is edited (the page's code holds the original wording and photos), so a new page needs no seeding. Home and Educator's first photos were seeded once with `studio/scripts/seed-site-pages.ts`. The photo slots and today's photos are in `studio/scripts/site-pages-catalog.ts`; load them with `studio/scripts/seed-site-pages.ts` (dry run by default, `--apply` to write; never overwrites a slot that already has content unless `--force`).
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
1. Text: on the page, read it with `site.text(key, fallback)` and spread `{...site.edit(key)}` on the element that holds only that text (wrap it in a `<span>` if it shares an element with other markup). Nothing else is needed. Use `site.lines()` for text with line breaks; pass extra slot keys as the third argument of `edit()` to show them in the right panel too.
2. Photo: use `site.image(key, fallback)` with `{...site.edit(key, "image")}` on the photo's wrapper. Nothing else is needed.
3. A Sanity item: put `data-doc={_id}`, `data-doc-type` (`contentItem`, `courseGroup` or `publication`) and `data-doc-label` on its element. A new type needs a case in `loadDoc` (`site/actions.ts`) and a window.
4. New page: add it to `SITE_PAGES` in `dashboard/lib/site.ts`, give the page `export const prerender = false`, call `getSitePage` and `site.applyCaching(Astro.response)`, and include the edit script at the bottom (`{site.preview && <script is:inline src="/edit-mode.js" data-origin={site.dashboardOrigin}></script>}`).
