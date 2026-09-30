# Course panel — a card that rises from the bottom when a course tile is clicked

User: "A long time ago I mentioned how the https://www.humaan.com/ card comes up from their portfolio section. This is what I'm imagining when I click on one of the course cards."
Reference screenshot (the user's): `ref-humaan-case-study-panel.webp` in this folder (Humaan "Work" -> "Sussex Taps").
Used for: Educator "Courses" section (`brands-logos-1-courses.md`): clicking a program tile opens its panel. Plan class `.course-panel`. Content: `teaching-page-content.md`. Inside: `.course-timeline` blocks (`structured-data-1.html`, Figma 80:12308).

## What the reference shows (Humaan)
- The page behind is dimmed and pushed back (a darkened, slightly inset copy of the page/hero is visible along the top, above the panel).
- A big rounded-top sheet (light background `#f2f2ea`-ish, radius ~48px on the top corners, side margins ~48px) has slid up from the bottom edge and covers ~80% of the viewport height, leaving a strip of the page visible at the top.
- Inside, top part = the "case study" header: big title ("Sussex Taps", ~56px) at the left, a dark pill button ("Visit Website" + arrow) with a category next to it ("Manufacturing"), an intro paragraph (larger, ~24px), body paragraphs (~18px, muted), and, at the bottom of the column, a list of tags/services with small colored icons ("Digital Strategy & UX", "Interaction Design"). At the right: one large rounded image (~1200 x 740).
- A round dark close button (X) sits at the top-right of the sheet, over the image.
- The sheet scrolls internally (content continues below the fold).
- The site's floating pill nav stays visible above everything.

## Our version (proposed; see README open questions)
- Trigger: each of the six program tiles in `.courses` is a `<button>` (or link with `href="#program-id"`); clicking opens that program's panel. Panel is always in the DOM (six `<section class="course-panel" id="...">`, hidden), opened with a class, no page navigation.
- Opening animation (CSS transitions, no library): backdrop `rgba(18,18,18,.4)` fades in; the page behind scales to .96 and dims slightly; the sheet slides `translateY(100%) -> 0` over ~600ms `cubic-bezier(.22,.8,.18,1)`. Closing = reverse. Close on: the X button, ESC, click on the dimmed strip, (and browser back is NOT used). Focus moves into the panel and is trapped while open; returns to the tile on close. `body { overflow: hidden }` while open; the sheet itself scrolls (`overflow-y: auto`, `overscroll-behavior: contain`).
- Sheet: full width minus 48px side margins (16px on mobile), top offset ~120px (a strip of the page shows), radius 48px 48px 0 0 (24px on mobile), background = a light card color (page tone, e.g. `#f2f1ee`), padding 72px 72px (24px on mobile).
- Sheet header (mirrors the reference, for one program), two columns: LEFT = program title (Instrument Sans ~56px), a pill/chip row with the role ("Immunology — Content Director · 2020–current") and the program logo, and a short intro paragraph; RIGHT = one large rounded image (Unsplash stand-in, cover). Round X button top-right over the image. (Tags row at the bottom-left of the reference = list the course codes as small chips.)
- Below the header: one `.course-timeline` block per YEAR / course group (e.g. "YEAR 1. The 'Plains'", "YEAR 3. The 'Alpine Summit'"), each with the LEFT column sticky while the RIGHT (courses + session topics) scrolls (Figma 80:12308). Programs without years (Dental, Graduate School, HI3, CU Denver) get one block per course.
- Mobile: sheet nearly full height, header stacks (image under title), timeline blocks stack (left title first, no sticky).
- No links/downloads. Buttons in the panel are stubs (`href="#"`) unless told otherwise.
