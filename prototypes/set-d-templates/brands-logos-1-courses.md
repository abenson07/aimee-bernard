# Courses tile grid — reference (Figma only; NO HTML was pasted for this section)

Source: Figma "Brands & Logos 1", node 80:11791 (Educator page, 1440 x 1002). The user named it "Courses".
Used for: Educator page "Courses" section -> plan class `.courses`.
Figma is the source of visual truth. No template HTML exists for this one: build from these values.

## Layout
- Section padding 120px 32px; container gap 64; background of the page (our page bg), NOT `#f5f4f1`.
- Title, centered, width 654: Instrument Serif 72px / line-height 1.1 / letter-spacing -1.44px, `#0b0b0b` (ours: Instrument Sans). Figma text is the template's ("Trusted by thousands that love that warm vibe") -> needs real words (open question).
- Tile grid: flex-wrap, gap 16, 3 columns (each tile 444 x 262), 2 rows -> six tiles.
- Tile: background `#e1e0de` (ours: the card color, e.g. `#d4c8ba`, unless told otherwise), radius 8, padding 23px 32px, `overflow: hidden`, flex column, `justify-content: space-between`, `align-items: center`, centered text.
  Top: optional small logo image (first two tiles only: 130x43 and 130x46) — otherwise a kicker; middle: name (IBM Plex Sans 32px / 48px, `#0b0b0b`, centered); bottom: small mono detail lines (11px / 14px, letter-spacing .75px, uppercase, rgba(24,23,21,.64)); some detail lines exist in Figma with opacity 0 (hidden) — do not show them.

## The six tiles as shown in Figma (copy is real-looking but the kickers look copy-pasted)
| # | node | top | name | bottom |
|---|---|---|---|---|
| 1 | 80:11797 | logo "CU Medicine" (image 29, 130x43) | CU School of Medicine | "IMMUNOLOGY" / "CONTENT DIRECTOR. 2020-CURRENT" |
| 2 | 80:12491 | logo "Univ. of Colorado Anschutz Medical Campus" (image 29, 130x46) | CU Child Health Advocate | "IMMUNOLOGY" / "CONTENT DIRECTOR. 2018-CURRENT" / "YEAR 1 AND YEAR 2" |
| 3 | 80:12397 | kicker "PHYSICIAN ASSISTANT (CHA/PA) PROGRAM" | CU School of Dental Medicine | (hidden line "32% increase in credibility", opacity 0) |
| 4 | 80:12401 | kicker "PHYSICIAN ASSISTANT (CHA/PA) PROGRAM" | CU Graduate School | (hidden) |
| 5 | 80:12477 | kicker "FUNSIZE WORKSHOP" | Human Immunology and Immunotherapy Initiative | (hidden "(HI3)") |
| 6 | 80:12481 | kicker "PHYSICIAN ASSISTANT (CHA/PA) PROGRAM" | CU Denver University Honors & Leadership Program | (hidden) |

Real data behind these (prototypes/data/educator-content.json / work-timeline.json), for the open question about correct kickers/details:
- Content Director, Immunology — CU School of Medicine — 2020-current
- Content Director, Immunology — CU Anschutz Physician Assistant Program (CU Child Health Advocate/Physician Assistant Program) — 2018-current
- Course Director, DSBS5511 Invaders & Protectors — CU School of Dental Medicine — 2019-2024
- Course Director, MIMS7530 Introduction to Immunology — CU Graduate School — 2021-current
- Fun-Size Immunology Workshop — CU Human Immunology & Immunotherapy Initiative (HI3)
- Course Director, UNHL4820 Scientific Thinking — CU Denver, University Honors & Leadership Program — 2015-2021

## Assets from Figma (expire in 7 days; not saved — re-fetch with get_design_context on 80:11791 if used)
`image 29` (CU Medicine logo, 82457.png) and second logo (5013c.png). Decide in the open questions whether to use logos at all.
