# Round 3 implementation plan

Simple, file-based prototypes under `prototypes/round-3/`. Each layout is a standalone HTML page (many are single-viewport, no scroll).

## Shared pieces (create once, link everywhere)

| Asset | Purpose |
|-------|---------|
| `round-3-tokens.css` | Figma field gray `#bccadb`, card `#d4c8ba`, ink, accent |
| `media-card.css` | BYQ small case-study card (thumb + title + tag + arrow) |

When the same HTML block appears on multiple pages, extract to the CSS file above (and optional shared snippet in this doc) — do not duplicate full styles per page.

## Pages (incoming)

| Page | Figma node | Status | Notes |
|------|------------|--------|-------|
| Home A | `80:12688` | Done | `home-a.html` — field bg, editorial name, roles, portrait, media card |
| (next) | TBD | Pending | User will paste code + Figma per page |

## Open questions (not blocking build)

1. **Display font** — Figma uses PP Editorial New; prototypes use Instrument Serif until a licensed webfont is added.
2. **Portrait asset** — Figma cutout vs `aimee-hero.png` (currently hero PNG).
3. **Media card link** — placeholder `work.html` until round-3 inner pages exist.
4. **Nav** — Home A frame has no nav; add later if other round-3 pages need it.
5. **Round 3 vs Set C** — Set C remains “Direction 3” full sets; round 3 is a separate layout exploration lane on the index.

## Per-page checklist

1. Pull Figma frame (background, type scale, positions).
2. Map copy to real site content where obvious.
3. Reuse `media-card` / future shared components.
4. `overflow: hidden` + `100vh` when design is single-screen.
5. Add entry under “Round 3” on `prototypes/index.html`.
6. Extend `publish.sh` to copy `round-3/`.
