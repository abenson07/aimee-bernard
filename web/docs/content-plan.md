# Site content plan

Brief for each scaffolded page, captured from the original planning conversation (2026-09-10). Pages are placeholders only — no design or copy yet. Use this doc as the source of truth when building each one out.

## Homepage (`/`, `web/src/pages/index.astro`)

Introduces Aimee and the key areas of her persona. Those areas are doorways into the four persona pages below. Highlights a few of her awards, then some recent content, then finishes with ways people can engage with her.

## Persona homepages

Four distinct pages, stylized a little differently based on who she is in that context. They feature content uploaded into the dashboard (`contentItem`s), but each page features it differently depending on what the content type/purpose is.

### Immunology (`/immunology`)

About her scientific credentials: lining up the work she's done and why it's important to her, then all the abstracts and articles she's written as an immunologist.

### Educator (`/educator`)

About what she's teaching, the awards tied to education work, and why teaching the next generation matters.

### Community Outreach (`/community-outreach`)

Persona homepage for her community outreach work (mirrors the structure of the other three; specific content TBD).

### Science Communication (`/science-communication`)

Persona homepage for her science communication work (mirrors the structure of the other three; specific content TBD).

## Program landing pages

Similar to persona pages, but designed specifically around a single program rather than a persona.

### Teach Like a Scientist (`/programs/teach-like-a-scientist`)

Landing page for the Teach Like a Scientist program.

### Teacher Training Program (`/programs/teacher-training-program`)

Landing page for the Teacher Training Program.

## Content page template (`/content/[slug]`)

One template with different variations depending on what it's presenting (article, video/YouTube link, talk, etc.) — effectively a way to surface a piece of content without fully leaving wherever the user currently is on the site.

**Dual behavior (not yet implemented):**
- **Bottom sheet mode**: when a link to a content item is clicked from the homepage, a persona page, or the timeline, intercept the click client-side and bring the content up as a bottom sheet over the current page (e.g. explains the work and links to it; embeds the YouTube player if it's a video). The URL updates via `history.pushState` to the canonical `/content/[slug]` URL.
- **Full page mode**: a direct visit or a reload of `/content/[slug]` renders the exact same template as a standalone full page (no sheet — a fresh load has no "opened from a click" state, so it just renders normally).

This means the sheet is never a dead end: whatever it shows also exists as its own shareable, reloadable URL.

## Resume / work timeline (`/work`)

A page of her work, most recent first, going backwards — a chronological timeline. Scrollable on the left side to move down through everything she's done, combined with her resume content (resume content itself to be supplied by Aimee later).

## Review & commenting system

See the plan file for the full design. Summary:
- Each candidate design (starting with the homepage) is deployed as its own Vercel Preview URL/branch, gated by Vercel's own preview protection.
- A client-side overlay lets Aimee click anywhere on the page to drop a pin: position is stored as a percentage of the full document (not viewport pixels), so pins replay correctly regardless of her screen resolution or aspect ratio.
- Each pin captures a cropped screenshot of its surrounding area (via `html2canvas`) plus the comment text, and saves as a `pageComment` document in Sanity.
- The same overlay reads back existing `pageComment`s for the current page/version and re-renders pins at the right spot for whoever is viewing, so both Aimee and Alex see the same comments positioned correctly.
- Not yet built — this is the design to implement next.
