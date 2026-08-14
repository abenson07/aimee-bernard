# Aimee Bernard

Client site built on [Lumos for Astro](https://github.com/lumosframework/lumos-for-astro), with Sanity as the CMS and Vercel as the host.

```
aimee-bernard/
├── studio/   # Sanity Studio (standalone)
└── web/      # Astro app (Lumos scaffold)
```

> Lumos is still beta (`v0.0.1`). The component API is settling, so prop names may shift before `v0.1.0`.

## Getting started

```sh
npm install
npm install --prefix studio
npm run dev:web      # Astro — http://localhost:4321
npm run dev:studio   # Sanity Studio — http://localhost:3333
```

| Script             | What it does                         |
| ------------------ | ------------------------------------ |
| `npm run dev:web`  | Starts the Astro dev server          |
| `npm run dev:studio` | Starts Sanity Studio               |
| `npm run build`    | Builds the Astro site                |
| `npm run check`    | Type-checks every `.astro` file      |
| `npm run typegen`  | Generates types from Studio schema   |

Copy `web/.env.example` to `web/.env` (already gitignored). Node 22.12 or newer is required.

Sanity project `18kcd13f`, dataset `production`. Studio is standalone — it is not embedded in the Astro app.

---

# Web Project — Architecture & Tooling Decisions

Tracking doc for the Astro + Sanity + Stacki build. Goal: reusable pattern across this client, personal sites, and future clients.

## Setup Order

1. **Create the GitHub repo** (empty, or with a Node `.gitignore`) — before scaffolding, so Stacki's git integration has something to attach to from the start.
2. **Clone lumos-for-astro into it as the base scaffold** — it's already a full Astro project, so this replaces a separate `create-astro` step.
3. **Add the `@astrojs/vercel` adapter**, configured for `output: 'hybrid'` (see decision #7) — static by default, with preview routes opted into server-rendering later.
4. **Initial commit + push** of this baseline. Confirms git/GitHub auth (`gh` CLI) works before relying on it mid-build.
5. **Build 2–3 components end-to-end**, committing at each stage: Stacki layout → props wrapper → Sanity schema → live data. Validates the pattern before scaling to the rest.
6. **Branch for the Sanity integration work** (e.g. `sanity-integration`) rather than working on `main`, since this changes how data flows through every component.
7. **Set up Presentation + preview/draft mode** as its own branch or PR — isolated from core Sanity wiring so a Presentation-specific issue doesn't block the rest.
8. **Merge to `main`** once content is flowing end-to-end. Stacki drops out of the loop here — `main` reflects the client-ready state. Confirm deploy is wired to `main`.
9. **Tag/branch for reuse extraction** — once this build is stable, pull the generic pieces (Lumos setup, Stacki-compatible component wrappers, base Sanity schema patterns) into a reusable starter repo/template for future sites.

## Decisions

### 1. Framework: Astro (confirmed over Next.js)

- Site is primarily static/CMS-driven — no auth, no dashboards, no heavy client state.
- Astro ships zero JS by default; only opts in per-component (islands) where needed.
- Matches Stacki's editing model, which depends on Astro's flat, file-based `.astro` component structure — doesn't map cleanly to Next.js/React conventions.
- Lighter weight = easier to standardize and reuse across multiple sites.

### 2. Component library: Lumos for Astro

- Provides base components (Section, Grid, Card, Nav, etc.) and a layered CSS/theming system.
- Not an editor — just building blocks. Still beta (v0.0.1), prop names may shift.

### 3. Visual layout tool (build phase only): Stacki

- Desktop app (Electron) for visually arranging Astro components and editing props while building — no code-writing needed for layout work.
- **Build-phase tool only** — not handed to the client. Very early project (0 stars, 4 commits), no CMS awareness, no permission system.
- Once visual structure is settled, Stacki drops out of the workflow.

### 4. CMS / data layer: Sanity

- All page content and structure live in Sanity — not just what's "wired up," but full page-builder–style modeling.
- Pattern: model sections/blocks as Sanity schemas (hero, text block, image+text, CTA, etc.), each mapping 1:1 to an Astro component.
- Whatever isn't included in the schema simply isn't editable by the client — this is how prop exposure gets controlled, rather than building a custom permissions layer.

### 5. Client editing experience: Sanity Presentation

- Plain Sanity Studio would require the client to navigate a separate CMS admin (not on-page).
- **Presentation** (Sanity's visual editing tool) shows the live site in an iframe with click-to-edit overlays, linking directly to the relevant Studio field.
- Requires extra setup: data attributes on Astro components to map DOM → Sanity fields, plus draft/preview mode wiring.
- Worth the upfront cost since the pattern is reusable across future components/sites.

### 6. Porting existing React/Next.js components

- Plain, presentational React components (no Next-specific APIs) port cleanly via `@astrojs/react` — imported into `.astro` files as islands, with `client:load`/`client:visible` etc. added only where interactivity is needed.
- Components using Next-specific APIs (`next/image`, `next/link`, `useRouter`, server actions, middleware, `getServerSideProps`/`getStaticProps`, App Router `"use client"` boundaries) do **not** port directly — these need to be rewritten against Astro's model (server-rendered by default, opt-in client JS per component) and against Sanity for data fetching.
- For Stacki to see a ported component's props, it needs a thin `.astro` wrapper declaring `interface Props` and passing them through to the React component — Stacki doesn't read React prop types directly.
- Rough sizing: simple presentational components ≈ 15–30 min each to port. Components with Next-specific data/routing logic baked in ≈ closer to a rebuild than a port.

**Per-component conversion checklist:**

- [ ] Strip/replace any `next/image`, `next/link`, `useRouter`, or other Next-only imports
- [ ] Move any data fetching out of the component and into Astro frontmatter (pulling from Sanity)
- [ ] Confirm component doesn't rely on Next's client/server boundary assumptions (`"use client"`, server actions)
- [ ] Import into Astro via `@astrojs/react`; decide if/which `client:*` directive it needs (or if it can stay static/server-rendered)
- [ ] Build a thin `.astro` wrapper declaring `interface Props`, passing them through — so Stacki can read and expose them
- [ ] Verify styling still applies correctly outside of Next's build pipeline (CSS modules, Tailwind config, etc.)
- [ ] Test in Stacki: confirm props panel reflects the wrapper's declared props correctly

### 7. Hosting & rendering config: Vercel + Astro `hybrid` output

- Public site is static content only (all Sanity, no login, infrequent publishing) — prerenders to static HTML by default. No server functions for regular visitors.
- `output: 'hybrid'` in `astro.config.mjs`, with `export const prerender = false` set only on the Sanity Presentation preview/draft routes — these are the only server-rendered pages, and only the client (while inside Sanity Studio) ever hits them.
- **Astro 7 note:** `hybrid` was merged into `static` in Astro 5. This project sets `output: 'static'` plus the `@astrojs/vercel` adapter, which is the same behavior — static by default, SSR later via `export const prerender = false` on preview routes. Setting `output: 'hybrid'` would error on this Astro version.
- Publish flow: client hits Publish in Sanity Studio → Sanity webhook fires → triggers a Vercel rebuild → static site updates automatically. No manual redeploy needed from either side; a short delay (not instant) is acceptable.
- `@astrojs/vercel` adapter added on top of the Lumos-based scaffold to enable this.

## Open / To Define

- Which specific section/block schema types to build first (start with 2-3 components built fully end-to-end — Stacki layout → Sanity schema → live data — before scaling to the rest).
- Draft/preview mode wiring details for Presentation.
- How schema/component pairs get packaged for reuse across client sites.

---

## How Lumos is put together

### The cascade

Styles are split across four cascade layers, declared in
[`global.css`](src/styles/global.css) in this order:

| Layer        | File                                      | Holds                                               |
| ------------ | ----------------------------------------- | --------------------------------------------------- |
| `base`       | [base.css](src/styles/base.css)           | Design tokens, color themes, the reset, text styles |
| `patterns`   | [patterns.css](src/styles/patterns.css)   | Multi-property patterns shared across components    |
| `components` | Each component's own `<style>` block      | The component itself                                |
| `utilities`  | [utilities.css](src/styles/utilities.css) | Single-property classes                             |

A later layer beats an earlier one whatever the selectors say, so components
override patterns and utilities override components.

### Theming

Four theme classes — `theme-light`, `theme-dark`, `theme-brand` and
`theme-invert` — each redeclare the same set of custom properties, so anything
inside them picks up the right colors without knowing where it sits. `Section`,
`BaseLayout` and `Card` all take a `theme` prop that applies one.

### Components

Layout: `Section`, `ContentWrapper`, `Grid`, `ButtonWrapper`
Content: `Heading`, `Paragraph`, `RichText`, `Eyebrow`, `Card`, `Button`
Media: `Img`, `Video`, `Icon`, `Overlay`
Chrome: `Nav`, `Footer`, `SkipLink`, `BaseHead`, `FormattedDate`

Every component takes a `render` prop; pass `false` to skip it and its children.
Components that would render nothing skip themselves.

See [example-components](src/pages/example-components.astro) for each one in
context.

### Site configuration

Site name, description, canonical origin, locale and the routes kept out of
search live in [`src/consts.ts`](src/consts.ts).

## License

This site is proprietary. See [LICENSE](LICENSE).
