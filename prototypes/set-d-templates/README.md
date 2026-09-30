# Set D (Round 3) — section order + template index

Everything for round 3 lives in the repo, not in chat. Read this file first, then `PLAN.md` (full specs, values, copy).
The `*.html` / `*.md` files in this folder are **reference only**: pasted Webflow templates (trimmed) and Figma notes. Never link or publish them.

Figma file `DEd4inAWh7icRkxpkJHxX3` (Aimee-Pugh-Bernard). Node ids below are `80:xxxxx` (URL form `80-xxxxx`).

## Global rules
- Output folder: `prototypes/set-d/` (pages + `shared.css` + `shared.js`). Also add a Set D card to `prototypes/index.html` and add `set-d` to the `cp -R` line in `prototypes/publish.sh`.
- Page background: flat `#bccadb` on every page (the gray-blue chosen in Figma), except the Public Speaking hero blue fade. Sections have no backgrounds of their own.
- Fonts (user's rule, overrides any template/Figma font): Instrument Sans, IBM Plex Sans, IBM Plex Mono. (Roles: headings = Instrument Sans, body/nav = IBM Plex Sans, labels/mono = IBM Plex Mono.)
- Figma is the source of visual truth. Templates are for layout + behavior only: restyle to our tokens; drop Webflow classes/scripts/GSAP; use CSS + a small IntersectionObserver.
- Repeated sections = ONE shared component in `shared.css`. Before adding a section, check the registry below.
- Name is hyphenated: Pugh-Bernard.
- Nav (banner + inset navbar + mobile menu) from `prototypes/set-b/index.html` is on every page.

## Section order per page

### Home A — `set-d/index.html` — Figma 80:12688 (single screen, no scroll)
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 0 | Nav | (none in Figma; user: include it) | Set B | nav | |
| 1 | Hero: name, 3 identity words (hover swaps background photo), flipped portrait, media card | 80:12688 (card 80:16362) | `hero-1-home-a.html` (ONLY the `.card-case-small`) | `.media-card` | card is a stub link `#`; tan `#d4c8ba`, coral `#e45a47` |

### About A — `set-d/about.html` — Figma 80:16601 (1440 x 5362)
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 0 | Nav | — | Set B | nav | |
| 1 | Hero "About Aimee" + rounded photo | 80:16633 (Hero 4, "the hero from Set A") | none (Figma only) | `.page-hero` | Figma copy is template text; use Set B mission line |
| 2 | Stats (3 numbers) | 80:16616 | none | `.stats-row` | Set B stats 25+/18/21; mono descriptions |
| 3 | What she's working on (4 columns) | 80:20660 | `value-features-1.html` | `.pillars` | **header LEFT-aligned** (user note); no numerals |
| 4 | Awards, with the wreaths | 80:20913 | none (wreath = `prototypes/src/wreath.svg` or Set B `<symbol id="wreath">`) | `.awards-row` | six awards from Set B |
| 5 | Resume | 80:20937 | `cms-grid-2.html` | `.resume` | static list, NO hover (user); rows = `kind: "position"` in `prototypes/data/work-timeline.json`; all links `#` |
| 6 | Prefooter | 80:20994 | `hero-5.html` | `.prefooter` | user: used on many pages |

### Home B — `set-d/home-b.html` — Figma 80:16558 (1440 x 9329)
| # | Section | Figma | Template file | Component | Notes |
|---|---|---|---|---|---|
| 0 | Nav | — | Set B | nav | |
| 1 | Hero card (rounded photo, name, identity words, glass widget) | 80:20418 (Hero 1) | `hero-1-home-b.html` | `.hero-card` + `.video-widget` | identity-word hover swaps the background photo (from Set B) |
| 2 | Mission (words + inline images) | 80:16559 | `intro-text-1.html` (upper portion only) | `.mission-text` | inline items = the Figma pill / sun / eye (assets in `prototypes/src/set-d/`); no marquee |
| 3 | Persona stack (sticky cards) | 80:20824 (Value & Features 9) | `value-features-9.html` | `.stack` | 3 personas; role photos with `object-fit: cover`; no section header |
| 4 | Stats | 80:21111 | (same as About A) | `.stats-row` | **reuse** |
| 5 | What she's working on | 80:21129 | (same as About A) | `.pillars` | **reuse** |
| 6 | Awards | 80:21165 | (same as About A) | `.awards-row` | **reuse** |
| 7 | Recent press | 80:21185 (CMS Grid 6) | `cms-grid-6.html` | `.press` | no heading (Figma has none); real press titles, links `#` |
| 8 | Prefooter | 80:21255 | (same as About A) | `.prefooter` | **reuse** |

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

## Component registry (one component, many pages)
| Component | Used on | Template |
|---|---|---|
| nav | all | Set B |
| `.media-card` | Home A | `hero-1-home-a.html` |
| `.page-hero` | About A | Figma 80:16633 |
| `.page-hero--split` | Public Speaking, Educator | `hero-5-stringer-public-speaking.html` |
| `.stats-row` | About A, Home B, Public Speaking (merged with mission) | Figma 80:16616 / 80:21111 |
| `.pillars` | About A, Home B | `value-features-1.html` |
| `.awards-row` | About A, Home B, Educator (six awards, no heading, merged with mission) | Figma 80:20913 / 80:21165 |
| `.resume` | About A | `cms-grid-2.html` |
| `.prefooter` | About A, Home B, Public Speaking, Educator, + others | `hero-5.html` |
| `.hero-card`, `.video-widget` | Home B | `hero-1-home-b.html` |
| `.mission-text` | Home B, Public Speaking, Educator | `intro-text-1.html` |
| `.stack` | Home B | `value-features-9.html` |
| `.press` | Home B, Public Speaking (recent appearances) | `cms-grid-6.html` |
| `.marquee` | Public Speaking | Set A `.cred-marquee` |
| `.contrib` | Public Speaking | `ecommerce-5.html` |
| `.tedx` | Public Speaking | `hero-8.html` |
| `.video-stack` | Public Speaking ALT (replaces `.tedx`) | `value-features-9-haldenmiller.html` |
| `.feature-pair` | Educator (Teacher Training Program + CCTSI Workshop Series cards) | `cms-grid-1.html` |
| `.course-panel` | Educator (rising sheet per program) | `course-panel.md` |
| `.course-timeline` | Educator (inside each panel; left sticky, right scrolls) | `structured-data-1.html` |
| `.courses` | Educator | `brands-logos-1-courses.md` (Figma only) |

## Template / reference files in this folder
`hero-1-home-a.html`, `hero-1-home-b.html`, `intro-text-1.html`, `value-features-1.html`, `value-features-9.html`, `cms-grid-2.html`, `cms-grid-6.html`, `hero-5.html` (Hummingbird prefooter), `hero-5-stringer-public-speaking.html`, `ecommerce-5.html`, `hero-8.html`, `value-features-9-haldenmiller.html`, `cms-grid-1.html`, `structured-data-1.html`, `brands-logos-1-courses.md`, `course-panel.md`, `teaching-page-content.md` (source content from the Wix teaching page), `ref-humaan-case-study-panel.webp` (the user's screenshot of the rising-sheet reference).
Each starts with a comment: source, what part is used, what is NOT used, what was trimmed, resolved token values, Figma values.
Trimmed from every paste: Webflow reset CSS, `w-*` widget CSS, `webflow-icons` font, the `window.__ix` interaction JSON, jQuery/GSAP/Webflow `<script>` tags, `data-w-id`, and inline start-state transforms. Component CSS + markup are kept; long `:root` token lists are summarized in each file's header comment.

## Working rule going forward
Every time the user sends a new paste or Figma link: (1) save the paste as its own file here, (2) add its row to the page's section-order table and to the registry, (3) add any open question. Never rely on chat.

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

## OPEN QUESTIONS — remaining (numbered; answer by number)
44. Panel header: I'll mirror the Humaan reference — big program title + role chip ("Immunology — Content Director · 2020–current") + short intro at the left, one large rounded photo at the right (Unsplash stand-in), round X at the top-right, course codes as small chips at the bottom-left. Right? Or should the header be minimal (title + chip only, no photo)?
45. Sticky left column copy (Figma has template text: title "YEAR 1. The 'Plains'", a paragraph, and a button "See in action"). Proposed paragraphs — CU School of Medicine Year 1: "Immunology woven through the eight organ-system courses of the first year of medical school." Year 3: "Advanced immunology and immunotherapy in the third-year Alpine Summit." Other programs: one sentence from the Wix description (e.g. Graduate School MIMS7530: "Introductory course providing foundation in immunology for students with general biology and cell biology backgrounds."). Button: keep it (Figma shows it) as a stub labelled "Course details"? Or drop the button? OK?
46. Timeline pill chips (Figma shows colored pills under each event): use them for facts from the page — e.g. "11 sessions", "Years 1-4", "2020-current". OK, or omit pills (the Wix page has none)?
47. Tile bottom lines (mono, small) per program from the Wix page: (1) "Immunology · Content Director. 2020-current · Years 1-4"; (2) "Immunology · Content Director. 2018-current · Year 1 and Year 2"; (3) "Course Director. 2019-2024 · Year 1"; (4) "Course Director. 2021-current / 2026-current"; (5) "Fun-Size Immunology Workshop"; (6) "Course Director. 2015-2021". OK?
48. The Wix page has no Teacher Training Program text. Use the repo data (CU Anschutz Teacher Training Program (TTP), 2018+) for that CMS Grid card. OK?

## BUILD STATUS (2026-09-27)
Built in `prototypes/set-d/`: `index.html` (Home A), `home-b.html`, `about.html`, `educator.html`, `public-speaking.html`, `public-speaking-alt.html` + `shared.css`, `shared.js`. Set D card added to `prototypes/index.html`; `set-d` added to `prototypes/publish.sh`.
Deviations / stand-ins: no Unsplash photos were downloaded (existing role photos `educator/immunologist/communicator.webp` + `aimee-bw.png` are used, cropped per slot); open questions 44-48 were resolved with the defaults written there; logos = the two Figma logos reused; the resume has a static list (no hover); the video-stack cards are non-link stubs.
Note: a `prototypes/round-3/` folder (Home A draft) was created by another session/user and is also listed in `publish.sh`; it is untouched.
Audit 2026-09-27 (all six pages, desktop 1440 + phone 390): fixed Home A name overflowing on phones, prefooter icons oversizing (img sizing) on phones, Public Speaking hero first photo collapsing on phones, "Read now" button clipping on phones, and Educator panel wording (now verbatim from the live Wix page). Verified: every course panel opens/closes, contributor hover-grow, press-card hover overlay, role swap, TEDx shrink, video stack; no horizontal overflow on any page at 390. Note: the preview browser cannot trigger real :hover under viewport emulation, so hover states were checked by applying the same CSS rules via a class.
Type audit 2026-09-28 (read from Figma via the plugin API, all five page frames): every text node that is a serif in Figma (Instrument Serif, PP Editorial New, IBM Plex Serif) is set in Instrument Serif (the Figma font itself) (`--serif` in `set-d/shared.css`, override block at the end of the file). General Sans headings -> Instrument Sans, General Sans body -> IBM Plex Sans, Inconsolata/Geist Mono -> IBM Plex Mono. Pillar heading text is "What she's working on now" as in Figma, with eyebrow + intro line. Page backgrounds: Home A blue #bccadb; all others #f5f4f1 (Figma section fill). Cards: persona/press #efede7, course tiles #e1e0de.
