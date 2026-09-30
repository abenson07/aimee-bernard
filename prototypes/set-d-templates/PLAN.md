# Third round prototypes — running plan

Status: COLLECTING. The user is naming pages and pasting Figma links plus HTML section code one page at a time. Nothing is built until they say they're done. Update this file after each page.

## Context
Round 3 makes new page layouts as prototypes, from Figma frames and pasted HTML sections. Every section is restyled to our look (see Style rules) but sits on the gray-blue background the user chose in Figma. The code will be built later by a simpler model, so each step below is concrete.

## DECISIONS (from the user; these OVERRIDE anything else in this file or PLAN.md)
Standing rule: **Figma is the source of visual truth. Do not make design changes, add labels/headings/buttons, or "improve" anything. If Figma shows it, build it as shown; if Figma doesn't, don't add it.** Copy that is obviously template placeholder text in Figma is replaced with real Aimee content (Set B copy / repo data) and flagged; layout stays exactly as Figma.

Home B
1. Hero photo: stand-in is fine (`educator.webp` default; identity-word hover swaps the card photo).
2. Glass widget: stub (thumbnail stand-in, title "A Small Change in the Air — Updated Schedule Starting September", label "Podcast Episode", link `#`).
3. Mission: use the ACTUAL Figma inline elements — three DIFFERENT ones, exactly as Figma: a photo pill (80:16563, 112x56), a sun icon (80:16565 "Squares black 4"), an eye icon (80:16564 "Squares black 5"). NOT the three role photos. Files saved in `prototypes/src/set-d/`: `mission-pill-vector.png` (222x112), `mission-squares-black-4.png` and `mission-squares-black-5.png` (1840x1380 sprites, cropped by CSS):
   - sun (black-4): box 64x64 at x=394,y=128 in the 1078x192 text block; `<img>` height 135.94%, left -38.1%, top -24.82%, width 181.25%, max-width none, inside `overflow:hidden`.
   - eye (black-5): box 64px tall, left 77.27% / right 16.79% of the block, at y=64; `<img>` height 128.91%, left -35.94%, top -14.45%, width 171.88%, inside `overflow:hidden`.
   - pill (Vector): 112x56 at x=529,y=0, image inset 0/0.45%.
   Placement in the Figma text: pill after "Experience coworking" (line 1), sun after "organic and" (line 2), eye after "your" (line 3). Keep the same three slots (after the first phrase, mid second line, before the last phrase). Text copy: Figma text is template placeholder ("Experience coworking … like never before, in an environment that's as organic and lively as your wildest dreams."); use the Set B mission sentence in the same 3-line rhythm (FLAG: confirm at review). Figma text: 64px / 64px line-height / -1.28px, centered, block width 1078, page padding 80px 64px.
4. Persona stack: 3 cards (Educator, Immunologist, Communicator).
5. Persona stack images: the role photos, `object-fit: cover` (crop to the wide 1312x607.5 frame).
6. Press featured card: user doesn't care — build as Figma shows (dark card).
7. Press grid: stub — real press titles from `data/work-timeline.json` (`kind: "press-mentions"`), links `#`. These are "just recent" items. Meta row as Figma (two mono items: outlet, then date; where no date exists, show only the outlet).
8. Press heading: NONE. Do not add "Recent press" or any label; Figma has no heading.
9. Prefooter copy: different per page. Figma shows "Sharing new ideas with new audiences" on BOTH About A (80:20994) and Home B (80:21255), so build both as shown; make the headline text a per-page value in the markup (each page has its own `<h2 class="prefooter__title">`) so copy can change later.

About A
10. Fonts: Instrument Sans headings / IBM Plex Sans body / IBM Plex Mono labels — confirmed.
11. About hero: photo `communicator.webp` and the Set B mission line — confirmed.
12. Awards: six, in one row.
13. Resume: stub everything — links `#`, "Full resume" `#`, six position rows as listed in PLAN.md.
14. Resume hover: stay light, and **NO hover behavior at all** — static list. No cursor-follow preview, no dark takeover, no background layers, no draw-line. (Rows may keep a plain cursor; no visual hover state unless Figma shows one.)
15. Prefooter: as shown in Figma, no button, no link, no deviation.

Assets saved from Figma (they expire in 7 days; already downloaded) in `prototypes/src/set-d/`:
- Mission: `mission-pill-vector.png`, `mission-squares-black-4.png`, `mission-squares-black-5.png`
- Prefooter: `prefooter-bg-vector.svg`, `prefooter-component-16.svg` (Component 16), `prefooter-component-19.svg`, `prefooter-component-20.svg`, `prefooter-component-18.svg`, `prefooter-component-21.svg`
  (Figma node -> file: 80:20998 = 16 (240px, rot 15deg), 80:21007 = 19 (187px, -30deg), 80:21012 = 20 (97px, -30deg, group inset 20.31% 14.25%), 80:21030 = 18 (175px, 30deg), 80:21038 = 21 (302.7px, 30deg, group inset 12.5% 11.73% 12.5% 16.74%). Background vector = the big circle.)

Status: user asked to KEEP COLLECTING. **Do not build pages yet.** Only save pastes/assets and update this file.

## Public Speaking page (added later — see README.md in this folder for the section table and open questions 16-26)
### Public Speaking — `set-d/public-speaking.html` — Figma 80:109 (1440 x 6248)
Background: THIS PAGE ONLY gets the "blue fade" (user: "This one can have the blue fade. the others we'll keep as is"). Figma: the hero frame is `linear-gradient(to bottom, #bbc9db, #f5f4f1)`; sections below sit on `#f5f4f1`. Other pages stay flat `#bccadb`. (See open question 16.)
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 0 | Nav | — | Set B | nav | |
| 1 | Hero: big headline + one-line sub + two rounded photos | 80:49 (1054 tall) | `hero-5-stringer-public-speaking.html` | `.page-hero--split` | blue fade lives here; headline text is placeholder in Figma ("Headline about public speaking"); NO buttons / foot row (template has them, Figma doesn't) |
| 2 | Mission + Stats, MERGED into one section | 80:588 (684 tall): mission text 80:16494 + stats 80:591 | (existing: `intro-text-1.html` mission + Figma stats) | `.mission-text` + `.stats-row` inside one wrapper | user: "Merge the stats and mission from the others." Same pill/sun/eye assets as Home B (`src/set-d/mission-*`); stats sit 160px below the mission (stats block y=352 in a 524px column) |
| 3 | Logo marquee | 80:108 (96 tall; padding 32; 32px-tall row; 64px gaps; 48px edge fades) | none — user: "Use marquee we have on Set A" | `.marquee` = Set A's `.cred-marquee` (`prototypes/set-a/index.html` lines ~121-127 CSS, ~285-303 markup) | Figma logos are placeholders (Forerunner, terra-tory, Sophia, etc.); use Set A's text logos (CU Anschutz, CU Denver, TEDx, AAI, The Conversation, MedPage Today, SELF, HuffPost), Figma frame size |
| 4 | "Aimee regularly contributes to..." (3 cards) | 80:110 | `ecommerce-5.html` (three panels only) | `.contrib` | no "Shop" label / "View all" link; cards: Podcast Name (Co-Host) / Podcast Name (Regular Guest Speaker) / Publication Name (Columnist) — placeholders |
| 5 | TEDx talk (scroll: big photo shrinks into frame) | 80:179 (Hero 8) | `hero-8.html` | `.tedx` | label "TEDx location", title "Title of TEDx talk" (placeholders; real data: TEDxCU April 2026); no foot row |
| 6 | Recent appearances | 80:4342 (CMS Grid 6) | (same as Home B: `cms-grid-6.html`) | `.press` | user: "use the same as the home b" — reuse the component; content differs |
| 7 | Sub footer | 80:532 (Hero 5) | (same as prefooter: `hero-5.html`) | `.prefooter` | Figma text "Sharing new ideas with new audiences" (same as About A / Home B) |


## DECISIONS — courses + panel (questions 39-43 and the course-panel request; these OVERRIDE anything above)
39. Courses tiles: ONE TILE PER PROGRAM (six): (1) CU School of Medicine, (2) CU Child Health Advocate / Physician Assistant Program, (3) CU School of Dental Medicine, (4) CU Graduate School, (5) CU Human Immunology & Immunotherapy Initiative (HI3), (6) CU Denver University Honors & Leadership Program. The courses are INSIDE each program (see `teaching-page-content.md`, taken from https://aepbernard.wixsite.com/my-site/teaching).
NEW REQUEST — course panel: clicking a program tile opens a large sheet that rises from the bottom (like Humaan's portfolio card; user's screenshot `ref-humaan-case-study-panel.webp`; spec `course-panel.md`). Inside the sheet: a header (title, role chip, intro, image, close X) and then one `.course-timeline` block per YEAR / course group (`structured-data-1.html`, Figma 80:12308): LEFT column (title such as "YEAR 1. The 'Plains'", paragraph, button) is STICKY while the RIGHT column (courses and their session topics) scrolls.
40. Copy: use the info on the Wix teaching page. CCTSI card (Educator CMS Grid 1): "Communicating Your Science to the Public" — Co-Director, 2023-current. Teacher Training Program card: from the repo data (2018+). Other placeholder slots keep my earlier proposals unless the user objects: Courses title "Courses Aimee directs and teaches"; CMS Grid tag "Programs", h2 "Building the next generation of teachers".
41. Logos: a logo on EVERY tile. Only two exist in Figma (CU Medicine, University of Colorado Anschutz Medical Campus): use those. Mapping: tiles 1, 3, 4 = CU Medicine logo; tiles 2, 5, 6 = Anschutz logo (stand-ins; swap when real logos are supplied).
42. Unsplash: my choice of subjects (classroom / lab / stage / microphone).
43. "Regularly contributes to" (Public Speaking page, the three cards): the user didn't know what this was about -> use my defaults: (1) Unbiased Science podcast — Immunology Expert; (2) The Immunology Podcast — Guest Expert; (3) The Conversation — Contributing Author. Placeholder text if unsure.

## DECISIONS — follow-ups to Public Speaking + Educator (questions 32-38; these OVERRIDE anything above)
32. Backgrounds: gray is fine. Public Speaking: blue fade on the HERO only, flat `#bccadb` below it. Educator: NO fade, flat `#bccadb`.
33. Hero words: my proposals are approved (Public Speaking headline "Talking about science so people listen" + sub "Talks, keynotes, and workshops on making immunology clear, honest, and human."; Educator headline "Teaching immunology so it sticks" + sub "Aimee has taught 18 courses at CU Anschutz since 2019, from first-year medical students to PhD trainees."; Educator logo chip "CU Anschutz").
34. Images: free Unsplash photos are fine for now (download at build time into `prototypes/src/set-d/`, credit photographer in an HTML comment; keep alt text; replace stand-ins on the Public Speaking hero, the "regularly contributes to" cards, and the Educator hero + CMS Grid 1 cards).
35. "Regularly contributes to": use the data. Two podcasts + one publication. Default (from `work-timeline.json`): (1) Unbiased Science (podcast) — "Immunology Expert"; (2) The Immunology Podcast — "Guest Expert"; (3) The Conversation — "Contributing Author" (3 articles + 1 Slate syndication in the data; user: "she regularly writes for a publication"). If any can't be confirmed from the data, use the Figma placeholder (Podcast Name / Publication Name). See open question 43.
36. Prefooter copy is DIFFERENT on each page. Educator = the Figma text at 80:12646: "Teaching the next generation of scientists". Public Speaking = Figma text "Sharing new ideas with new audiences". About A and Home B = as shown in their Figma frames (currently identical text) — each page's headline is its own value.
37. Educator "CMS Grid 1": BUILD IT — the two cards are the Teacher Training Program and the CCTSI Workshop Series (template `cms-grid-1.html`; no "Read now" buttons — Figma has none).
38. Courses: REAL courses; KEEP the logos; build the FIRST TWO Figma tiles as the template and make the other four like them (logo on top, name in the middle, small mono lines at the bottom). Grouping of the 18 courses into six program tiles is proposed in `brands-logos-1-courses.md` (open question 39).

## DECISIONS — Public Speaking (user answers to questions 16-25; these OVERRIDE the proposals below)
16. Blue fade: HERO ONLY (see open question 32 for what sits below it).
17. Hero copy: REAL words (proposal in open question 33).
18. Hero photos: NOT stand-ins — swap out for new images (open question 34: where do images come from).
19. Mission + stats: same mission sentence as Home B; stats 25+ / 18 / 21 "for now".
20. Marquee: Set A's text logos in Figma's 96px-tall frame — yes.
21. "Regularly contributes to": REAL names + new images (open questions 35, 34).
22. Card hover: KEEP the hover-grow (hovered card grows, flex-grow 1 -> 2.5) but NO image swap: same image, `object-fit: cover`, so it simply gets wider. Plain CSS transition (no GSAP).
23. TEDx: the REAL talk (label "TEDxCU · April 2026"; title "Confessions of a Scientist: Science education needs communication training").
24. TEDx scroll effect: YES — build the full big-photo-shrinks-into-the-frame effect from `hero-8.html` (plain JS as specified in that file).
25. Recent appearances: stub like the Home B press section — real titles from `data/work-timeline.json` (talks/podcasts, most recent), links `#`.
26. Sub footer (Public Speaking): use the copy given in Figma — "Sharing new ideas with new audiences".
27. Video stack heading: my call — "Watch Aimee make science land." (48px, centered, as Figma's heading slot.)
28. Video stack videos: exactly three, in this order (back to front): (1) "Confessions of a Scientist: Science education needs communication training" — TEDxCU · April 2026; (2) "Research Day Keynote Speaker" — Colorado State University, College of Health & Human Sciences · March 2026; (3) "From Data to Dialogue: Science Communication for the Real World" — University of Rochester myHub · October 2025. Stand-in photos (role photos, cover) until real images are supplied; no real video links exist.
29. Video stack card text: big line (32px) = talk title, caption (14px) = event + date. Light tile on the back two cards, glass tile on the front card, as Figma.
30. Video stack playback: STUB ONLY — no links, no player, no play button. Cards are plain (non-link) elements: no `href`, no click behavior, no hover link styling.
31. Alt page: `public-speaking-alt.html`. On the Set D card in `prototypes/index.html` list it as **"Video Alts"** (a separate entry linking to the alt page). Nav links identical to the other pages.


## Public Speaking ALT (questions 27-31 answered — see DECISIONS)
### Public Speaking ALT — `set-d/public-speaking-alt.html` — Figma 80:12215 for the swapped section
User: "I want an alt for the tedx section ... instead showcasing multiple video and stack them ... I'd like to just have an Alt page where we just swap this out."
= EXACTLY the Public Speaking page above, with **section 5 (TEDx `.tedx`) replaced** by `.video-stack` (Figma "Value & Features 9", 80:12215; template `value-features-9-haldenmiller.html`). Nothing else changes; build the shared sections once (one source, two pages) — do not fork.
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 1-4 | same as Public Speaking (hero w/ blue fade, mission+stats, logo marquee, regularly contributes to) | 80:49, 80:588, 80:108, 80:110 | (same) | (same) | |
| 5 | **Video stack** (REPLACES TEDx) | 80:12215 | `value-features-9-haldenmiller.html` | `.video-stack` | centered 48px heading + three overlapping sticky cards (976 / 1078 / 1144 wide), each a video with a text tile bottom-left; earlier cards scale down + darken as the next arrives |
| 6-7 | same as Public Speaking (recent appearances, sub footer) | 80:4342, 80:532 | (same) | (same) | |



### Educator — `set-d/educator.html` — Figma 80:11790 (1440 x 4663)
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 0 | Nav | — | Set B | nav | |
| 1 | Hero | 80:8204 (Hero 3, 1174 tall) | same as Public Speaking hero: `hero-5-stringer-public-speaking.html` | `.page-hero--split` | user: "Hero: same as public speaking one". Figma difference: the right column is a 20px medium sentence + a small logo chip ("[CU logo] Anschutz", image 28, 103.5x26) instead of the 20px mono line; headline "Headline about teaching science" (112px); same two photos (912 / 448 wide, 640 tall, radius 16). Blue fade? -> open question 32 |
| 2 | Mission + Awards | 80:11962 (615 tall) | existing mission + awards row | `.mission-text` + `.awards-row` in one section | user: "Same as public speaking but swap in the 6 awards": mission identical to Public Speaking; the stats row is replaced by the SIX awards (wreath + title + meta, from Set B). Figma shows a 5-column row with NO heading and 112px gap below the mission: build the awards row WITHOUT its heading here |
| 3 | Courses (six program tiles) | 80:11791 (1002 tall) | `brands-logos-1-courses.md` (Figma only) | `.courses` | one tile per program (decision 39); logo on every tile; each tile is a BUTTON that opens its course panel (next row). Content: `teaching-page-content.md` |
| 3b | Course panels (six, hidden until a tile is clicked) | Figma 80:12308 (the timeline inside); rising-sheet behavior from the Humaan reference | `course-panel.md` + `structured-data-1.html` | `.course-panel` containing `.course-timeline` blocks | sheet rises from the bottom; inside, per YEAR/course group, LEFT sticky / RIGHT scrolls; content from the Wix teaching page |
| 4 | CMS Grid 1 — two photo cards: Teacher Training Program + CCTSI Workshop Series | 80:12648 (900 tall) | `cms-grid-1.html` | `.feature-pair` | user: "This is for the teacher training program and the cctsi workshop series." Tag chip + h2 in Figma are placeholders ("Blog" / "Thinking through structure"): see open question 40. No "Read now" button (not in Figma) |
| 5 | Prefooter (Hero 5) | 80:12595 | `hero-5.html` | `.prefooter` | Educator's OWN text (Figma 80:12646): "Teaching the next generation of scientists" |

## Where things go
- New folder `prototypes/set-d/` (round 3). Sets A/B/C stay untouched.
- One file per page: `set-d/index.html` (Home A), `set-d/about.html` (About A), and so on. Plain HTML, inline `<script>`. Page-specific CSS may be inline; anything used on more than one page goes in `set-d/shared.css`, linked with `<link rel="stylesheet" href="shared.css">`.
- Shared scripts (mobile nav toggle, reveal-on-scroll, prefooter mouse parallax) go in `set-d/shared.js`, loaded with `<script src="shared.js" defer>`.
- Asset paths: `/prototypes/src/...`, as Set B does. Figma SVG assets go in `prototypes/src/set-d/` (see Prefooter).
- Register the round in `prototypes/index.html`: copy the Set C `<li>` card block (lines ~167-179), name it "Set D", tag "Round 3", and list Home and About. Also change the intro paragraph at line ~132 to mention Set D.
- `prototypes/publish.sh`: add `prototypes/set-d` to the `cp -R` line (currently `set-a set-b set-c`). `cp prototypes/*.css` there only covers the top folder, so set-d/shared.css and shared.js ride along with the folder copy.
- Before writing, read `prototypes/set-b/index.html` (nav CSS lines 64-122, nav markup 406-435, mobile toggle JS 763-779, identity-word hover and role background swap CSS lines 124-148 and JS from line 820) and reuse those patterns.

## Style rules
- **Fonts (the user's answer, overrides whatever the pasted HTML or Figma says):** Instrument Sans, IBM Plex Sans, IBM Plex Mono. Assignment (decided here, confirm at review): headings and big display text = Instrument Sans; body copy and nav = IBM Plex Sans; mono labels, stat descriptions, card labels = IBM Plex Mono. One Google Fonts `<link>` in each page: `family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@300;400;500`.
  - Instrument Sans is wider than the serif in Figma, so the big sizes below need `clamp()` and a check at 1440 that "About Aimee" and the name still fit on one line.
- Tokens in shared.css: `--bg: #bccadb` (page background, flat, every page), `--ink: #121212`, `--muted: rgba(18,18,18,.64)`, `--dim: rgba(18,18,18,.4)`, `--line: rgba(18,18,18,.14)`, `--accent: #e45a47`, `--card: #d4c8ba`, `--paper: #f2f1ee` (nav card only).
- Do NOT use the pasted templates' colors, fonts, or `#ece8e2`/`#f5f4f1`/white section backgrounds. Sections have no background of their own; the page `--bg` shows through. Templates are for layout and behavior only (memory: unify template sections).
- Drop every Webflow class (`w-*`), `data-w-id`, ix2 scripts, jQuery, and GSAP SplitText from the pastes. Reveal-on-scroll = one small IntersectionObserver in shared.js that adds `.is-in` (fade + 16px rise). Respect `prefers-reduced-motion`.
- Hyphenate the name: Pugh-Bernard.
- Breakpoints 900px and 767px as in Set B.

## Component registry (dedupe rule)
Before building any pasted section: compare class names and markup with this table. Same markup means reuse the row and add the page to "Used on". Same markup with different content means reuse it and pass new content. New means add a row.

| Component | Source | Class prefix | Used on |
|---|---|---|---|
| Nav (banner + inset navbar + mobile menu) | Set B | `.nav-*`, `.navbar`, `.banner` | all pages |
| Media card | pasted Webflow hero-1 (`card-case-small`) + Figma 80:16362 | `.media-card` | Home A |
| Page hero ("About Aimee" title + rounded photo) | Figma Hero 4, 80:16633 | `.page-hero` | About A |
| Stats row (3 big numbers) | Figma Intro & Text 2, 80:16616 (Home B: 80:21111, identical) + Set B `.stat` | `.stats-row` | About A, Home B |
| Outreach pillars (4 columns) | pasted Stringer value-features-1 + Figma 80:20660 (Home B: 80:21129, identical) | `.pillars` | About A, Home B |
| Awards row (wreaths) | Figma Intro & Text 3, 80:20913 (Home B: 80:21165, identical) + Set B `.award` | `.awards-row` | About A, Home B |
| Resume list (hover preview) | pasted Stringer cms-grid-2 + Figma 80:20937 | `.resume` | About A |
| Prefooter | pasted Hummingbird hero-5 + Figma Hero 5 80:20994 (Home B: 80:21255, identical) | `.prefooter` | About A, Home B; the user says most pages |
| Hero card (rounded photo with name, words, widget) | pasted Baseframe hero-1 + Figma Hero 1, 80:20418 | `.hero-card` | Home B |
| Video widget (glass card) | Figma 80:20431 + pasted `video_small-widget` | `.video-widget` | Home B (different markup from `.media-card`, which is horizontal on tan) |
| Mission text (words + inline images) | pasted Hummingbird intro-text-1 (top part only) + Figma 80:16559 | `.mission-text` | Home B |
| Persona stack (sticky cards) | pasted Stringer value-features-9 + Figma 80:20824 | `.stack` | Home B |
| Press (featured card + 3x2 grid) | pasted HaldenMiller cms-grid-6 + Figma 80:21185 | `.press` | Home B |

The pillars header is left-aligned (user's note). Note the pasted CSS puts the intro in grid columns 7-13; use columns 1-7 instead, matching Figma (container x=32, width 680).

## Pages

### Home A — Figma 80:12688 (file DEd4inAWh7icRkxpkJHxX3)
File: `set-d/index.html`. Single screen, no scroll (`height: 100vh; overflow: hidden`).
Answers so far: nav IS included; the identity words DO swap a background photo on hover; the media card is a stub (`href="#"`, no link target).
- Nav on top: shared component. The Figma frame (1440x850) shows no nav, so the nav floats over the top with the banner; keep the name block vertically centered on the viewport, unaffected by the nav.
- Full-bleed `--bg`.
- Name, left, centered vertically (~55% down): "Aimee " in `--ink` + "Pugh-Bernard" in `--dim`. Instrument Sans, `clamp(3.5rem, 6.1vw, 5.5rem)`, letter-spacing -0.05em, line-height 1.15. Left padding 32px.
- Under it: Educator / Immunologist / Communicator, 32px, gap 16px, 50% opacity, hover opacity 1. Copy Set B's `.identity-words` and its role-background swap (two `.hero-role-bg` layers cross-fading, images `/prototypes/src/educator.webp`, `immunologist.webp`, `communicator.webp`; when a word is hovered the name and words turn white and the portrait fades out). Skip the mascot.
- Portrait `/prototypes/src/aimee-hero.png`, bottom-aligned, `transform: scaleX(-1)` like Set B, `right: 10%`, `height: ~90vh`, `z-index` below the name block and card.
- Media card, bottom right (x=1041, y=704, 361x120): `.media-card` — background `--card`, `backdrop-filter: blur(8px)`, radius 8, padding 12, gap 16, `max-width: 361px`. Left: 96x96 square, radius 8, background `--accent` (stub for a future image). Right column: text "A Small Change in the Air — Updated Schedule Starting September" (14px/20px IBM Plex Sans, `--ink`) pinned top; bottom row pinned bottom: 8px `--accent` square (radius 2px) + "CASE STUDY" (IBM Plex Mono 10px, uppercase, letter-spacing .75px, weight 300) on the left, and a 12px arrow at the right (`M5 12H19M19 12L12 5M19 12L12 19`, stroke `--accent`, 1.5px, round caps). Whole card is `<a href="#">`.
- Under 900px: hide the portrait (as Set B does); card moves to the bottom center.

### About A — Figma 80:16601 (1440 x 5362), file `set-d/about.html`
Section order top to bottom (from the Figma metadata). Every section is the shared component above, on `--bg`, nav on top.
1. **Hero** (`.page-hero`, Figma 80:16633, 1088 tall). Padding 120px 32px 40px, gap 40px.
   - Label: centered, IBM Plex Mono uppercase 14px, letter-spacing .7px. Figma text ("Experience coworking") is template copy; use "About".
   - Title: "About Aimee", centered, Instrument Sans, `clamp(5rem, 13.9vw, 12.5rem)`, letter-spacing -0.04em, line-height .92.
   - Image container: full width (inside 32px gutters), 656px tall, radius 24, `overflow: hidden`, cover photo `/prototypes/src/communicator.webp` with a `rgba(0,0,0,.35)` overlay, and centered white text (Instrument Sans 64px, line-height 1, letter-spacing -.02em, max-width 866px): "The immune system is endlessly fascinating, and my job is to inspire you to think so too." (Set B mission copy; the Figma text is template copy).
2. **Stats** (`.stats-row`, Figma 80:16616). Padding 176px 64px. Three equal columns, gap 24, centered text. Number: Instrument Sans `clamp(5rem, 8.9vw, 8rem)`, line-height .9, letter-spacing -.02em. Description: IBM Plex Mono 20px/28px, letter-spacing -.3px, `--muted`. Copy from Set B: "25+ / Years as an educator, scientist & communicator", "18 / Courses taught", "21 / Talks given" (the Figma 80% / 20+ / 13x is template copy). Reveal: each number fades up. Under 767px: one column.
3. **What she's working on** (`.pillars`, Figma 80:20660). Padding-block 120px. Header LEFT-aligned in the left 680px: label (IBM Plex Mono uppercase 11px, letter-spacing .08em) "Outreach"; h2 "What she's working on" (Instrument Sans `clamp(2.75rem, 5vw, 4.5rem)`, line-height 1, letter-spacing -.03em). No intro paragraph. Below (gap 64px): 4-column grid, `border-top: 1px solid --line`, gap 16px, each column has padding-top 24, gap 24: title (Instrument Sans 24px/1.1, 500), description (IBM Plex Sans 16px/1.5, `--muted`), then an image `aspect-ratio: 3/4` radius 16 `object-fit: cover`. Skip the I/II/III/IV numerals (Figma has none). Content from Figma:
   1. Think Like a Scientist — "Hands-on science outreach for elementary and middle-school kids, alongside volunteer scientists at CU Anschutz." (image: `communicator.webp`; link `https://tlasprogram.wordpress.com/`)
   2. Fun Size Immuninja — "Uses her expertise as an immunologist to break down the science of the immune system for anyone who comes across her page." (image: `immunologist.webp`; link `https://www.instagram.com/funsizeimmuninja/?hl=en`)
   3. Teacher Training Program — "Mentors PhD students and postdocs on curriculum, teaching, and assessment to ensure lasting training benefits." (image: `educator.webp`; link from Set B line 496)
   4. The World of Autoimmunity — "Unbiased Science Podcast · April 2025. A recent conversation on autoimmune disease, unpacked for a general audience." (Figma title placeholder: "Podcast Name"; image: `aimee-bw.png`; link `https://www.youtube.com/watch?v=zV58abJ_nTQ`)
   Each column is an `<a>` around title+text+image. Stagger reveal (children fade in with 100ms steps). At 991px: 2 columns; at 479px: 1 column.
4. **Awards** (`.awards-row`, Figma 80:20913). Padding-block 80px. Centered h2 "Award-winning educator" (Instrument Sans `clamp(2.5rem, 4.4vw, 4rem)`, line-height 1, letter-spacing -.03em), gap 112px to the row. Each award: the wreath (`/prototypes/src/wreath.svg`, ~110px wide, color `--ink`) on top, then title (IBM Plex Sans 600 16px/1.3) and meta line (IBM Plex Mono uppercase 12px, `--muted`). Use the same six awards as Set B (lines 704-733 of `set-b/index.html`). The Figma row has 5 columns; use `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` so all six fit without dropping any. If `wreath.svg` doesn't render right (check it in the browser), copy Set B's inline `<symbol id="wreath">` instead.
5. **Resume** (`.resume`, Figma 80:20937, ~1000 tall). Section padding-block 120px. Header row (flex, space-between, bottom-aligned): left = label "Resume" + h2 "Where she's worked" (Instrument Sans 72px scale as above), right = text link "Full resume" (IBM Plex Mono uppercase 11px, letter-spacing .08em, border-bottom 1px). List of 6 rows, each `<a href="#">` in a grid `1fr 7fr 2fr 2fr`, gap 16, padding-block 24, `border-top: 1px solid --line`, last row also border-bottom: number ("01") in mono label style, title (Instrument Sans 24px/1.1, 500), organization (IBM Plex Sans 12px, `--muted`), dates (IBM Plex Mono uppercase 11px, right-aligned). Data: first six entries with `kind: "position"` in `prototypes/data/work-timeline.json` — hard-code them into the HTML in this order: Associate Professor, Department of Immunology and Microbiology (CU Anschutz School of Medicine, 2019–present); Course Director, MIMS6062 Introduction to Science Communication (CU Graduate School, 2026–present); co-Director, CCTSI Workshop Series (CCTSI, 2023–present); Course Director, MIMS7530 Introduction to Immunology (CU Graduate School, 2021–present); Content Director, Immunology (CU School of Medicine, 2020–present); Human Immunology and Immunotherapy Initiative Assistant Director (CU Anschutz, 2015–present).
   - Desktop hover behavior (pointer: fine, width > 991px), rewritten without GSAP: a 240x320 preview image (radius 8) follows the cursor with a `transform` set from a `mousemove` handler (32px right of the cursor, vertically centered, CSS `transition: transform .35s`); images cycle by row index over `educator.webp`, `immunologist.webp`, `communicator.webp` (repeat for rows 4-6). While the list is hovered, the whole section turns dark: a full-bleed blurred copy of the active row's image behind a 72% `#121212` scrim fades in, and all text/lines switch to light (`#ece8e2` at full and 64% for secondary text, lines at 12%). Because the page is gray-blue, this dark takeover is the one intentional exception to "no dark backgrounds"; note it as a question below.
   - Under 992px: no hover behavior, static list; each row shows a small 3:2 thumbnail under the title (as in the paste at that breakpoint).
6. **Prefooter** (`.prefooter`, Figma Hero 5 80:20994 + pasted hero-5). Used on many pages, so it must live in shared.css / shared.js and be one HTML block that can be pasted per page. Padding: 0 64px 120px; content max-width 1312.
   - Big text: "Sharing new ideas with new audiences" centered, width 994px max, Instrument Sans `clamp(4rem, 13.9vw, 12.5rem)`, letter-spacing -.04em, line-height .92 (Figma 200px / 184px / -8px). Hero-5's slide-up word mask: use CSS only — each line in an `overflow: hidden` wrapper, inner span translates from 110% to 0 when `.is-in` is added by the reveal observer.
   - Icons: five decorative SVGs floating above the text, absolutely positioned inside a 1312x487 `.prefooter__icons` box (percent positions from Figma, x/1312 and y/487): Component 19 (left 0, top 26 → 0%, 5%, rotate -30deg, 187px), Component 16 (left 350 → 27%, top 22 → 4.5%, rotate 15deg, 240px), Component 18 (left 719 → 55%, top 0, rotate 30deg, 175px), Component 21 (left 867 → 66%, top 74 → 15%, rotate 30deg, 303px), Component 20 (left 27 → 2%, top 305 → 63%, rotate -30deg, 97px). Icons overlap the title's top by 187px (`margin-bottom: -187px` on the icons box). Mouse parallax as in hero-5 (about-b images 1-5 shift ±30/40/50/20/40px on X and ±20/20/30/30/20px on Y across the section): a `mousemove` handler on `.prefooter` computes the cursor's position as -1..1 in the section and sets `translate` on each icon (use the CSS `translate` property, so it doesn't fight `rotate` in `transform`); `transition: translate .4s`. Disable under 767px.
   - Background shape: the big pale ellipse behind (Figma vector, 2190px circle, rotated -10.82deg, top -791px) is the template's cream `#f5f4f1`-like swoosh. Recolor it to `rgba(255,255,255,.35)` so it reads on `--bg`, drawn as an absolutely positioned circle (`border-radius: 50%`, 2190px, `left: -375px; top: -1143px`) clipped by the section (`overflow: hidden`).
   - Icon files: the Figma asset URLs expire in 7 days and are not in the repo. At build time, call `get_design_context` again on node 80:20994, and save each SVG named in the returned constants (`imgComponent16`, `imgComponent19`, `imgGroup10122748`, `imgComponent18`, `imgGroup10122747`) with `curl -L -o prototypes/src/set-d/prefooter-N.svg <url>`. They are white with black detail; if they look wrong on `--bg`, that's expected (they're the emoji-style stickers) — leave as is. Save the background vector `imgVector` too, only if the CSS circle looks wrong.

Steps for About A, in order: (1) add the Google Fonts link and the shared tokens; (2) build the nav, hero, stats in `about.html` and check at 1440; (3) pillars, awards; (4) resume list (static first, then hover); (5) prefooter, fetch icon SVGs; (6) mobile pass at 375; (7) Set D index card + publish.sh.

Steps for Home A: as listed in the Home A section, plus shared.css/shared.js first, since both pages use them.

### Home B — Figma 80:16558 (1440 x 9329), file `set-d/index.html` is Home A, so this is `set-d/home-b.html`
Scrolling page. Nav on top (shared). Sections in order, all on `--bg`:
1. **Hero card** (`.hero-card`, Figma Hero 1 80:20418, 890 tall). Section padding 32px. Inside, one rounded card (radius 24, `overflow: hidden`, `min-height: calc(100vh - 64px)`, padding 64, content pushed to the bottom with flex `justify-content: flex-end`). Background: photo layer(s) cover the card; left-to-right dark gradient (`linear-gradient(270deg, rgba(39,36,31,0), rgba(39,36,31,.64))` as in Figma) and a bottom blur overlay (247px tall, `backdrop-filter: blur(16px)`, gradient to `rgba(39,36,31,.32)`).
   - Name: "Aimee Pugh-Bernard" (hyphen), Instrument Sans `clamp(3.5rem, 6.7vw, 6rem)`, letter-spacing -.045em, line-height 1.07, color `#eee9e1`, max-width 448px so it wraps to two lines like Figma.
   - Bottom row (flex, space-between, align end): left = identity words Educator / Immunologist / Communicator (32px, 16px gaps, active word 100% opacity, others 50%). The user said the background swaps here too: copy Set B's `.hero-role-bg` two-layer cross-fade; hovering a word makes it the active one (100%) and swaps the card photo to that role's image (`educator.webp` / `immunologist.webp` / `communicator.webp`); default state shows Educator's image. The words are the hover targets, as in Set B.
   - Right = `.video-widget` (243px wide): background `rgba(39,36,31,.44)`, `backdrop-filter: blur(6px)`, radius 16, padding 16, gap 16; a 209x117 image (radius 8; stub `communicator.webp`); under it two IBM Plex Mono 10px uppercase lines (letter-spacing .75px, line-height 12px): "Podcast Episode" at 64% opacity, then "A Small Change in the Air — Updated Schedule Starting September" at full `#eee9e1`. Stub link `href="#"`. Drop the template's play button, video, and lightbox.
   - Drop the template's parallax and load animations. Optional: `.fade` reveal on the name.
   - Mobile (<900px): card min-height 560px, padding 24, widget hidden, words wrap.
2. **Mission** (`.mission-text`, Figma 80:16559, 352 tall, padding 80px 64px). Centered flex-wrap block, max-width 945px, gap 10px. Words in Instrument Sans `clamp(2.25rem, 4.4vw, 4rem)`, line-height 1, letter-spacing -.02em. Each word is wrapped in a `.hide` mask (`overflow: hidden`, small padding-bottom) and slides up when the section enters view (CSS transition on a `.is-in` class, 50ms stagger via `--i` inline var). Inline images between words, as in the paste: one 112x56 photo pill (radius 28) after word 1, two 64x64 round images later, all `object-fit: cover`, scale-in reveal. Use only the top part of the paste: no arrow, no marquee, no service cards. Copy (Set B mission line, since Figma text is template copy): "The immune system is endlessly fascinating [pill: educator.webp], and my job — across teaching, communication [immunologist.webp], and outreach — is to inspire you [communicator.webp] to think so too!" Figma also has two small black stickers (the sun icon and the eye icon) instead of extra photos; skip them, use the three photos.
3. **Persona stack** (`.stack`, pasted value-features-9 + Figma 80:20824). Padding-block 120px. Cards are full width (1376), `position: sticky; top: 96px`, padding 32, radius 24, gap 32, card background `--card` (`#d4c8ba`, since the template's `#d5d1c8` is a similar tan). Inside each card: head row (grid 1fr 1fr, gap 64, align end): left = mono label ("I.", "II.", "III.") over the persona name (Instrument Sans 40px/1.02, -.03em); right = one sentence, IBM Plex Sans 16px/1.5, `--muted`, max-width 44ch, aligned right on desktop. Below: image (aspect-ratio 1312/607.5, radius 16, cover). Three cards (Figma shows four; there are three personas):
   - I. Educator: "Aimee has been teaching at CU Anschutz since 2019." image `educator.webp`
   - II. Immunologist: "Aimee is a published immunologist with 12 peer-reviewed papers to her name." image `immunologist.webp`
   - III. Communicator: "Aimee is passionate about making immunology accessible to all." image `communicator.webp`
   Behavior without GSAP: in shared.js, on scroll (rAF), for each card except the last, take the next card's `getBoundingClientRect().top`; progress p = clamp((vh - top) / (vh - 96), 0, 1); set the card's `transform: scale(1 - .08*p) translateY(-24px*p)` and `opacity: 1 - p`, `transform-origin: top`. Disabled (cards static, `position: static`) under 768px and with reduced motion. Gap between cards 40px. No section heading (Figma has none; the paste's "Care" header is dropped).
4. **Stats** — reuse `.stats-row` from About A (same 3 numbers). Figma 80:21111.
5. **What she's working on** — reuse `.pillars` from About A. Figma 80:21129.
6. **Awards** — reuse `.awards-row` from About A. Figma 80:21165.
7. **Recent press** (`.press`, Figma 80:21185, 1501 tall). Padding 160px 32px 80px, gap 80px. No visible heading in Figma; add a small left label "Recent press" (mono, uppercase) above the featured card, gap 24 (the user named the section "Recent press").
   - Featured card: grid 1fr 1fr, gap 16, padding 16, radius 16, height 445px, background `--ink` (`#121212`; the Figma card is dark `#1e1c1b`; keep it dark), text `#f7f7f2`, no dashed border (that's a Figma editing artifact). Left column padding 16, flex column space-between: title (Instrument Sans 32px/36px, -.03em) + a 14px/20px IBM Plex Sans subtitle; then a 1px line at 16% white, then a row: meta (mono 12px uppercase, letter-spacing .75px: "KOA Morning News" 88% white, "August 2025" 64%) and a "Read now" glass button (padding 12px 16px, radius 16, `rgba(247,247,242,.04)` fill, 1px border `rgba(247,247,242,.08)`, 16px/24px medium; text-swap hover: two stacked copies sliding up like Set B's `.button-text` mask). Right column: image, radius 16, cover. Content: title "CU Immunology Prof discusses mRNA research funding"; subtitle "A conversation on how research funding shapes the science people rely on." (placeholder sentence, flag to the user).
   - Grid: 3 columns, gap 16, 2 rows, each card 360px tall, padding 32, radius 16, flex column with title top and a footer (1px line at 16% ink, 24px gap, mono meta: outlet, date) bottom. Card background `--card` (`#d4c8ba`; Figma `#efede7`). Title: Instrument Sans 24px/28px, -.02em. Hover on desktop: a photo layer (`.press-card__img`, cover, with a 32% dark overlay) fades in over the card in 200ms and text/lines turn `#f7f7f2` (the paste's hover; Figma card 1 is shown in the hover state). Photo layers: cycle `educator.webp`, `immunologist.webp`, `communicator.webp`.
   - Six grid cards, all `<a href="#">` (stub) — data from `prototypes/data/work-timeline.json` entries with `kind: "press-mentions"`, hard-coded in this order: (1) "Science Communicators Strategize How to Demystify Science" · CU Anschutz Today; (2) "How an Immunity Gap May Be Fueling the Recent Spike in Respiratory Viruses" · SELF; (3) "TLaS is Increasing Elementary Schoolers' Access to Science" · CU Anschutz Today · February 2021 (link `https://news.cuanschutz.edu/medicine/increasing-access-to-science`); (4) "5 Sneaky Signs You're Getting Sick" · HuffPost; (5) "Fake News: Medical Quackery Enters a New Dimension" · CU Anschutz Today; (6) "TLaS Making Science Cool and Fun" · CU Anschutz Today · August 2020 (link `https://news.cuanschutz.edu/news-stories/making-science-cool-and-fun`). Most entries have no date in the data; the meta line shows only the outlet when there's no date. The mono meta's first item is the outlet (strong), second the date (medium).
   - Under 991px: grid 2 columns, featured card single column, image on top (height 264). Under 479px: 1 column.
8. **Prefooter** — reuse `.prefooter` (Figma Hero 5 80:21255).

Steps for Home B: after shared.css/shared.js exist from Home A/About A: (1) hero card + widget + role swap; (2) mission text; (3) persona stack; (4) paste the shared stats, pillars, awards blocks; (5) press; (6) prefooter block; (7) mobile pass; (8) add "Home B" to the Set D card on `prototypes/index.html`.

## Step 0 for the build: save the pasted code
The user's pasted HTML lives only in this conversation and will be lost. Before building anything, save each paste to `prototypes/set-d/templates/` (trimmed of the Webflow reset, `webflow-icons` font, `w-*` classes, the ix2 JSON, and the jQuery/GSAP `<script>` tags, but keeping the component CSS and markup exactly as pasted), so the simpler model can read them:
- `hero-1-home-a.html` (Modulabs hero-1, the media card) → Home A
- `hero-1-home-b.html` (Baseframe hero-1) → Home B hero
- `intro-text-1.html` (Hummingbird) → Home B mission (top part only)
- `value-features-9.html` (Stringer stack) → Home B persona stack (CSS + markup + the two `<script>` blocks)
- `value-features-1.html` (Stringer pillars) → About A / Home B pillars
- `cms-grid-2.html` (Stringer journal) → About A resume (CSS, markup, script)
- `cms-grid-6.html` (HaldenMiller) → Home B press
- `hero-5.html` (Hummingbird) → prefooter
These are reference only: not linked from any page, and not copied by `publish.sh` (it copies `set-d` whole, so add `--exclude`-style handling: put them in `prototypes/set-d-templates/` instead, outside `set-d`). Use `prototypes/set-d-templates/`. This step needs the user's pastes at build time: since a new session won't have them, do this step in THIS session, right after the plan is approved and before any building.

## Open questions
All answered — see DECISIONS at the top of this file.

## Verification (at build time)
- Serve `prototypes/` statically (for example `python3 -m http.server` from `prototypes/` is fine; use the preview tools, not Bash, per the harness) and open `/set-d/index.html` and `/set-d/about.html`.
- Compare screenshots at 1440 with Figma nodes 80:12688 and 80:16601; check each section against its node screenshot.
- Hover checks: Home identity words swap the background; About resume rows show the preview and dark takeover; prefooter icons move with the cursor.
- Resize to 375 wide: no horizontal scroll on either page; pillars stack to one column; nav menu opens.
- Console has no errors; fonts load (check computed font-family).
- `bash prototypes/publish.sh` from the repo root only if needed to confirm `set-d` is copied.

## OPEN QUESTIONS — remaining (numbered; answer by number)
44. Panel header: I'll mirror the Humaan reference — big program title + role chip ("Immunology — Content Director · 2020–current") + short intro at the left, one large rounded photo at the right (Unsplash stand-in), round X at the top-right, course codes as small chips at the bottom-left. Right? Or should the header be minimal (title + chip only, no photo)?
45. Sticky left column copy (Figma has template text: title "YEAR 1. The 'Plains'", a paragraph, and a button "See in action"). Proposed paragraphs — CU School of Medicine Year 1: "Immunology woven through the eight organ-system courses of the first year of medical school." Year 3: "Advanced immunology and immunotherapy in the third-year Alpine Summit." Other programs: one sentence from the Wix description (e.g. Graduate School MIMS7530: "Introductory course providing foundation in immunology for students with general biology and cell biology backgrounds."). Button: keep it (Figma shows it) as a stub labelled "Course details"? Or drop the button? OK?
46. Timeline pill chips (Figma shows colored pills under each event): use them for facts from the page — e.g. "11 sessions", "Years 1-4", "2020-current". OK, or omit pills (the Wix page has none)?
47. Tile bottom lines (mono, small) per program from the Wix page: (1) "Immunology · Content Director. 2020-current · Years 1-4"; (2) "Immunology · Content Director. 2018-current · Year 1 and Year 2"; (3) "Course Director. 2019-2024 · Year 1"; (4) "Course Director. 2021-current / 2026-current"; (5) "Fun-Size Immunology Workshop"; (6) "Course Director. 2015-2021". OK?
48. The Wix page has no Teacher Training Program text. Use the repo data (CU Anschutz Teacher Training Program (TTP), 2018+) for that CMS Grid card. OK?
