# Aimee's website audit: change list and open questions

Source: five Word audits from Aimee (Opening, Educator, Communicator, Outreach, Contact), her three emails (10/16, 10/19 x2), and the 16 photos in `images/`. All of her feedback is treated as received. Written 2026-10-24.

Tags: **[CODE]** change in the site code. **[DB]** content in the Sanity dashboard. **[ART]** new artwork to draw. **[Qn]** blocked on question n below.

## 0. Status of her feedback

- Received and covered here: Opening (Home), Educator, Communicator, Outreach, Contact.
- **Not received: Immunologist tab and Work tab audits.** Her 10/19 email said she'd review those "tomorrow and Wednesday" (10/20 and 10/21). No such files exist. See Q27.
- Photo still owed by Aimee: her 10/16 email says "I am missing one photo for the 'Immunologist' opening. I need to pose in a lab coat in a lab doing something cool and get a photo. I can do this next week!" See Q2.
- Decisions already made by Alex: draw the B cell, dendritic cell and macrophage cartoons (approved); build the "Ask me a Q?" bot and write demo scripts (approved); every photo needs review before it goes live.


## 0b. Decisions log (2026-10-24, from Alex)
- H1, H2, H3: Alex asked whether the cartoon lines are Aimee's own words. They are, verbatim from her Opening document. Drawing the three cartoons is approved.
- H4, H5: approved ("That sounds good"). Footer game germs still pending in Q12.
- H6: approved. Plan drafted in [PLAN-ask-me-a-q-bot.md](PLAN-ask-me-a-q-bot.md).
- Q1: resolved. Use her stated choices; repetition is fine, she'll correct it herself when she sees it.
- Q2: resolved differently. A composite was discussed and then dropped (Alex, 10/24): waiting for her real lab-coat photo instead.
- Q3: resolved. Use `SCI COMM DMRSEF Aimee.jpg` for the CU Denver panel.
- Q4: resolved. Use 'TTP Aimee'.
- Q5: reframed. She did ask for it: Educator, "Communicating Your Science to the Public" card, "Swap out photo to 'CCTSI' below". Still open whether the whole slide (logo, second person) is acceptable.
- Q6: reframed as two separate asks (reorder, and replace the large photo). Needs a screenshot to decide.
- Q7(a): the two lab-coat photos she mentions in the Communicator doc are not in hand. Alex is getting the originals from Aimee directly. Not shown again until they arrive.
- Q6 to Q27 were re-asked with screenshots and her exact quotes.


## 0c. Working queue (one question at a time)
Alex asked for one question at a time, easiest first. Update the status here as each is answered.
Screenshots and candidate photos are saved in `audit-review/` (not committed; `screenshots/`, `candidate-photos/`, `from-her-docs/`).

| # | Question | Status |
|---|---|---|
| 1 | Q23 Graduate School: rename the second pill to "Introduction to Science Communication" | RESOLVED: yes, rename it; her nine topics fill the empty list; photo 'EDU THC Antibody' applied (file in hand) |
| 2 | Q22 Fun-Size: "Immunotherapy" as a group heading (four groups) | RESOLVED: four groups; SWITCHED TO OPTION B (Alex, 10/26): each of the four groups is its own section (left title, right topic list), like Graduate School. Done with a new optional `topics` field on each course-tile section in Sanity; no special typing needed. Fun-size candy bag photo applied |
| 3 | Q16 Awards stat "9+" as written | RESOLVED: all four approved: label "Years as an Educator, Immunologist & Communicator" 25+, Courses taught 30+, Talks given 100+, new fourth stat Awards received 9+ |
| 4 | Q17 "All work" blue shade | RESOLVED: option B, #6aa8ff (T cell cartoon blue), text and arrow bigger. Applies to BOTH "All work" buttons: Home (`index.astro`) and Educator (`educator.astro`); a color scan of all 7 pages found no other yellow-green element. CSS in `home.css` and `educator.css` |
| 5 | Q11 optimize images, don't commit originals | RESOLVED: yes. Web-sized copies (desktop + phone sizes, about 200-600KB each), ALL converted to WebP including the HEIC. Originals stay local in `images/`, not committed |
| 6 | Q12 germs: top-left cast only; interferon | RESOLVED: remove rhinovirus, staph and E. coli from the top-left cartoon only; footer game stays as is; interferon stays (she didn't mention it) |
| 7 | Q14 "static" sections | RESOLVED (Alex): she means the numbers must be typed-in static numbers, not driven by the CMS. The pinned scroll-swap STAYS. Home stats are already typed in the page. Text edits built: "this" and "since 2011" removed. Org text "School of Medicine" is a Sanity change (the two 2023 awards say "CU School of Medicine"). Whether the awards section itself should be typed-in vs Sanity is settled in Q15 |
| 8 | Q19 Communicator numbers: numbers only or Home look | RESOLVED (Alex): numbers only. Built: same four figures and labels, Communicator keeps its own smaller style |
| 9 | Q21 OK to edit Sanity directly | RESOLVED: yes, edit Sanity. Blocker: no Sanity write token on this machine. Alex to put `SANITY_API_WRITE_TOKEN` in `studio/.env.local` (gitignored); never paste it in chat |
| 10 | Q26 CU Anschutz logo: chip only or everywhere | RESOLVED (Alex): everywhere. Built: Educator chip removed, Work-card mapping and Home strip fallback removed, logo files deleted, logo cleared from the Sanity "CU Anschutz" publication (backup in `audit-review/`). A scan of all 7 pages finds no CU Anschutz image. The CU Denver logo is a different logo and was left. Open: the CCTSI slide (Q5) contains the Anschutz logo |
| 11 | Q13 bot: books, which pages, phone placement | queued |
| 12 | Q15 outreach awards | RESOLVED + BUILT (Alex): awards live in Sanity with a new "Award group" (teaching / outreach & mentoring); each section shows the six most recent, newest first from the left. Four outreach awards created in Sanity (venue for the last is just "CU", as she wrote it). Home: new fourth panel in the pinned sequence, no eyebrow label (Alex: removed the eyebrow on both awards panels; heading height kept level with the other panels). Immunologist: placeholders replaced by the real outreach awards (closes BEN-1703). Work page Award filter now 10. PR #3 (round 1) was merged before this |
| 13 | Q20 bottom half circle | RESOLVED + BUILT (Alex): cartoons removed completely; instead of a shorter curve, copy the humaan.com footer transition: page body gets rounded bottom corners (60px; 32px phone) and over the last ~350px of scroll scales back to 95% (anchored at its bottom edge) while the dark footer content drops down into place. Eased smooth scrolling (Lenis, desktop mouse/trackpad only; touch stays native). Applies to Educator, Communicator, Immunologist. Home's footer unchanged |
| 14 | Q18 Communicator big text | RESOLVED + BUILT: her new text at today's type size (6 lines desktop, 10 on a phone), immune cell and antibody kept. (Q13 bot is on hold at Alex's request) |
| 15 | Q25 Contact TEDx card; form destination | RESOLVED + BUILT: heading "Let's connect.", her paragraph, her portrait; TEDx card removed (Alex: the call was right). Form messages go to aepbernard@gmail.com (Alex, 10/24). The service that sends them (BEN-1704) is the next question |
| 16 | Q24 Outreach details | BUILT but Alex is NOT happy with the layout ("I'll come up with a better layout for the outreach page"). Committed as 8d365d5 (page with her intro, four dark boxes, link buttons; TLaS box removed from Immunologist). **WAITING ON ALEX'S LAYOUT.** Her text and links are in `web/src/pages/community-outreach.astro` and can be reused. |
| 17 | Q6 Communicator hero photos | RESOLVED + BUILT (Alex: C, "obviously the TEDx one"): small b/w TEDx photo left, TEDx front stage right; phones show the big photo only. Upscale list in `PHOTOS-TO-UPSCALE.md` (the front stage file is low-res) |
| 18 | Q7 "contributes to" cards | RESOLVED + BUILT (Alex: "looks great"): four cards, her links, hover movement kept. Photos: Science Crosstalk = SUBSTACK collage, Unbiased Science = b/w TEDx portrait, @funsizeimmuninja = FUNSIZE IG collage. Immunology Explained shows its logo on a soft tile; role line left blank (Alex). **WAITING ON AIMEE: her lab-coat photos (laughing or tubes); when they arrive, put ONE on the Immunology Explained card** |
| 19 | Q8 "Read now" feature | RESOLVED + BUILT (Alex: Option A): TEDx scientist photo and link to https://aimeepughbernard.substack.com/p/confessions-of-a-scientist; applied in code to the item titled "Confessions of a Scientist…" |
| 20 | Q9, Q10 photos | queued |
| 21 | Q5 CCTSI slide | RESOLVED + BUILT (Alex: Option 2): her CCTSI slide with Aimee and Wendy's photos swapped so Aimee is on the left, the Anschutz/CCTSI header strip painted out, aligned left in the card; card links to her CCTSI URL. NOTE: these are edits to her slide that she did not ask for; tell her. Teacher Training card = TTP Aimee |
| 22 | Q27 Immunologist and Work audits | RECEIVED 10/27; change lists are in section 1, new questions Q28 to Q40 |

Resolved so far: Q1, Q2, Q3, Q4, Q11, Q12, Q14, Q16, Q17, Q18, Q19, Q21, Q22, Q23, Q26 (see log above).

Rule from Alex (10/24): where she named a photo and the file is in `images/`, just apply it; don't ask again. Applies to: Medical School, Graduate School = 'EDU THC Antibody'; PA, Dental = 'EDU THC Thymus'; Human Immunology = fun-size bag; Home cards TLaS / FUNSIZE IG / TTP / SUBSTACK; Home Communicator hover = 'SCI COMM TEDx scientist'; Contact portrait; Teacher Training = 'TTP Aimee'; CU Denver = DMRSEF.

## 0d. Questions to ask Aimee (collected as we go)
1. ~~**Fun-Size workshop details layout (from Q22).**~~ DECIDED 10/26 (Alex): Option B is built; just tell Aimee. Old notes: Option A was: her four groups as labeled blocks in the right-hand list of the one "Fun-Size Immunology Workshop" section. Option B: the four groups as purple-circle items on the left, each with its own section, like Graduate School. Which does she prefer? Screenshots (preview mocks): `audit-review/screenshots/q22-optionA-groups-in-right-list.png` and `q22-optionB-groups-as-left-items.png`. Her third group is written as a bullet ("IMMUNOTHERAPY Harnessing the Immune System"); we're treating it as a group heading.


## WAITING ON / DECISIONS (updated 10/25)
- **Her Immunologist and Work audits:** RECEIVED 10/27 (see section 1, Q28 to Q40). Still coming from her: Articles, Press, Educational Content review, more talks.
- **Ask Aimee:** (1) Fun-Size workshop: Alex chose Option B (built, 10/26); tell her, don't ask. (2) Role line for the "Immunology Explained" card: Alex chose "Content Contributor" (10/27, built); tell her.
- **Tell Aimee (not a question):** the CCTSI slide card. Photos swapped so she's on the left and the Anschutz header removed, because the cards grow on hover and the original slide either looked odd shrunk or cut off the title when grown. Open to re-laying out the slide if she had something else in mind.
- **Resolved by Alex 10/25:** Awards stat stays 9+ (stop asking). Fourth outreach award stays "CU" (University of Colorado; no logo). Lab-coat photo guesses are fine (smile = Communicator card; tubes = hero and hover); she'll say if not.
- **Alex:** Outreach page layout (his to design; her text and links are in `community-outreach.astro`, commit 8d365d5, not in the PR). Contact form service (five options sent 10/25). "Ask me a Q?" bot: planning 10/25 (see `PLAN-ask-me-a-q-bot.md`). How Aimee swaps images in Sanity (discussed 10/25).
- Upscaled photos: done 10/24.

## 0e. Build log (building happens as we go, per Alex 10/24)
Built, checked in the browser, committed locally (not pushed):
- B cell, dendritic cell and macrophage cartoons drawn and added to the header rotation with her exact lines (commit c8d71e4). Awaiting Alex's OK on the art.
- Header cartoon: rhinovirus, staph, E. coli removed (both `nav.js` and `shared.js`); influenza line now says "flu vaccine". Commit c033697.
- "See all" button on Home and Educator: new label, blue #6aa8ff, 76px tall with 24px text. Commit a35f911.
- Home By the Numbers: 25+ (new label), 30+, 100+, and a fourth stat "Awards received 9+"; four columns on desktop. Commit after a35f911.

Also built: Home headings ("this" and "since 2011" removed), commit 06b4790.

- Communicator numbers match Home (25+, 30+, 100+, 9+ awards), typed in; Communicator stats kept in its own style (Alex: "just the numbers"). Commit 69c36f1. Note: `communicator.astro` still has Alex's uncommitted Sanity-page work in the working tree; only the stats hunk was committed.
- Course tile icons: medical bag (PA Program) and vaccine with heart (Human Immunology) drawn; Studio options added. Commit 2b2f651.
- Photos converted to WebP in `web/public/site/photos/` (desktop and phone sizes, 1.9MB total for the 10 in use).
- **Sanity edits applied** (10/24, via `studio/scripts/apply-audit-edits.ts`; backup of the 11 changed documents in `audit-review/sanity-backup-*.json`): 2023 award venues now "School of Medicine"; course tile order Med, PA, Grad, HI3, Dental, Denver; icons (Med = stethoscope, PA = medical bag, HI3 = vaccine with heart); panel photos (Med and Grad = EDU THC Antibody, PA and Dental = EDU THC Thymus, HI3 = fun-size bag, Denver = DMRSEF); Graduate School second pill renamed and its nine topics added; Fun-Size four headed groups; Scientific Thinking ten topics. Group headings in topic lists ("# " prefix) supported in `CourseGroups.astro`. Verified on /educator: order, icons, photos, pills, topics, no errors.

- CU Anschutz logo removed everywhere; Educator top text now "Since 2007, Aimee has taught 30+ courses, from first-year medical students and PhD trainees to faculty and community members." (typed in). Commit after 5dcbac3.

- Communicator big text replaced ("Science belongs to everyone…") with the immune cell and antibody. Commit after d2cd191.

- Contact page: "Let's connect.", her paragraph, her portrait (WebP), TEDx card removed. Commit after 6467580.

- Educator: flu virus removed from the mission sentence; award rows closer together (row gap 56 to 24px) and less space before the courses. Commit f36c96d.

- Educator hero left photo: 'EDU THC Antibody' (Alex chose A). Commit after 289cf5f.
- Educator awards/course spacing: BUILT as option 3 (Alex): row gap 36px, 40px under the awards, 80px above the courses. (Was open:) Educator awards/course spacing. It IS in her notes ("can we space the top 3 closer to the bottom 3? Love the spacing between the 3 on each row so please maintain" / "Decrease spacing between awards and 'Courses Aimee directs and teaches'") but she gave no amounts; mine (row gap 24px, less space before courses) was a guess and Alex isn't a fan. Three options screenshot: `audit-review/screenshots/educator-spacing-options.png`.

- Home portrait hover: Educator = EDU THC Antibody photo; Communicator = TEDx photo + her new text; Immunologist = her new text (photo waiting on Alex's lab-coat composite). Commit after e17cca9.

- Home "What Aimee's Working On": heading, her four photos, Science Crosstalk card (Substack), Teacher Training link without /overview. TLaS photo crop: center (Alex, "she is in the center there"). Commit c739b15.

Still to build from approved items: Home hover photos (Educator = same EDU THC Antibody as the hero, Alex chose A), Home hover photos and card photos/links, Communicator changes, Outreach page, Contact, bottom half-circle, "Ask me a Q?" bot.

## 1. Changes by page

### Home
Header cartoon (top-left mascot):
- [ ] [ART] Add **B cell**: "Hi! I'm a B cell. I make antibodies." / "B cells mature in the bone marrow" / "Each B cell recognizes one specific antigen" / "Some of us turn into memory cells and stick around for years"
- [ ] [ART] Add **dendritic cell**: "Hi! I'm a DC. I capture germs to sound the alarm." / "I patrol the body looking for invading pathogens" / "I chop invading germs to bits and show them off to my friends" / "My show-and-tell helps my friends join an immune response"
- [ ] [ART] Add **macrophage**: "Hi! I'm a macrophage. My name means 'big eater'" / "I'm a phagocytic cell – that means I eat germs for a living." / plus the same last two lines as the DC
- [ ] [CODE] Remove rhinovirus, staph, E. coli from the top-left cast only (the footer game keeps them). Keep coronavirus. [Q12, resolved]
- [ ] [CODE] Influenza line: "flu shot" becomes "flu vaccine"
- Interferon stays: it's in the cast today and she didn't mention it. [Q12, resolved]

Top right:
- [ ] [CODE] "Ask me a Q?" scripted bot: a B cell holding a sign, preprogrammed Q&A to help explore the site ("books, awards, writing…"). Needs a question set. Related: BEN-1684, BEN-1697, BEN-1698. [Q13]

Hero portrait hover:
- [ ] Educator: text stays; photo becomes 'EDU THC Antibody' or 'EDU THC Thymus' [Q1]
- [ ] Immunologist: text becomes "Meet a published immunologist! Aimee studied B cell development and autoimmunity for her PhD"; photo 'need to curate' [Q2]
- [ ] Communicator: text becomes "Aimee is passionate about making all science, especially immunology, accessible for everyone!"; photo 'SCI COMM TEDx scientist' (file received)

"What She's Working On":
- [ ] [CODE] Heading becomes "What Aimee's Working On"
- [ ] Think Like a Scientist: link to its website [Q24]; photo 'TLaS Aimee Ask a Q' (file received, has text burned in) [Q9]
- [ ] Fun Size Immuninja: link to Instagram (https://www.instagram.com/funsizeimmuninja/); photo 'FUNSIZE IG collage' (file received)
- [ ] Teacher Training Program: link becomes https://medschool.cuanschutz.edu/immunology-and-microbiology/dept-resources/teaching-resources/teacher-training-program (today's ends in `/overview`); photo 'TTP Aimee' (file received)
- [ ] "World of Autoimmunity" becomes "Science Crosstalk", link https://aimeepughbernard.substack.com/, subheading "Where Science and Communication Collide", photo 'SUBSTACK collage' (file received)
- [ ] "All work": blue (#6aa8ff) square around the arrow, bigger text and arrow. Same change on the Educator page's "All work" button. Button text also changes from "All work" to "See all" (Alex, 10/24), on both. [Q17, resolved]

By the Numbers:
- [ ] [CODE] Labels and numbers: "Years as an Educator, Immunologist & Communicator" 25+ (the label changes from "educator, scientist"), Courses taught **30+**, Talks given **100+**, new fourth stat **Awards received 9+**. [Q16]
- [ ] [CODE] "Trusted by / appeared with" section: delete the word "this" ("I've shared science in classrooms…")
- [ ] [CODE] Awards section heading: delete "since 2011"
- [x] [CODE] "Static" = numbers typed by hand, not from the CMS (already true on Home). Pinned scroll-swap stays. [Q14, resolved]
- [ ] [CODE/DB] 2023–2026 awards: every organization line reads "School of Medicine" (today a mix of "SCHOOL OF MEDICINE" and "CU SCHOOL OF MEDICINE")
- [ ] [CODE+DB] New awards section "Outreach and mentoring that makes a difference.", styled like the teaching awards, one wreath each with the year in the center: 2026 Community Partner Spotlight Award, Aurora Public Schools; 2024 CU Women in STEM Mentorship Award, CU Anschutz; 2023 CU Women in STEM Community Service Award, CU Anschutz; 2022 Chase Faculty Community Service Award, CU. [Q15]

Kept as is (she loves them): hero-portrait hover concept, the cell/germ "fruit ninja" game and its text, the By the Numbers quote, the bottom text, links and name.

### Educator
- [ ] [CODE] Top-right text: "Since 2007, Aimee has taught 30+ courses, from first-year medical students and PhD trainees to faculty and community members." (her draft says "Aime", see Assumptions). Related: BEN-1688.
- [ ] [CODE] Remove the CU Anschutz logo chip ("they are very protective of it!"). [Q26]
- [ ] [CODE] Hero left photo (not her): 'EDU THC Antibody' or 'EDU THC Thymus'. Keep the TEDx photo as is. [Q1]
- [ ] [CODE] Mission sentence: remove the flu virus, keep the immune cell and the antibody
- [ ] [CODE] Awards: space the top three rows closer to the bottom three, keep the spacing between the three on each row; reduce the gap between awards and "Courses Aimee directs and teaches"
- [ ] [ART] Cartoons: move the stethoscope to CU School of Medicine; PA Program gets a white medical bag with a red cross instead of the white coat; Human Immunology vaccine gets a little heart by the needle tip or in the liquid ("I am on a mission to rebrand vaccines as love")
- [ ] [DB] Tile order: top row Med School, PA Program, Graduate School; bottom row Human Immunology, Dental Medicine, CU Denver University Honors. Today it is Med, PA, Dental / Graduate, HI3, Honors. Tile text stays "perfect as is."
- [ ] [DB] Panel photos: Medical School 'EDU THC Antibody'; PA 'EDU THC Thymus'; Graduate School 'EDU THC Antibody'; Human Immunology: the fun-size candy bag (file received); Dental 'EDU THC Thymus'; CU Denver: ? [Q3]; see also Q1 (the same two photos get reused)
- [ ] [DB] Graduate School: the purple course pills become "Introduction to Science Communication" [Q23], with nine topics listed under it:
  Strategies for Effective Science Communication / Science Writing That Makes an Impact: From Op-Eds to Blogs and Beyond / The Art of Science Storytelling: Turning Your Science and Research into Compelling Stories / The Power of 60 Seconds: Crafting a Memorable Elevator Pitch / Navigating Challenging Conversations / Beyond Words: The Art and Science of Visual Communication / Expanding Your Reach with Social Media / Strategies for Successful Media Interviews / The Voices of Science: Conversations with Professional Communicators
- [ ] [DB] Human Immunology (Fun-Size Immunology Workshop) details: **Immune System in Balance** (Cells, Organs and Microenvironments of the Immune System; Innate Immunity and the Complement System; Adaptive Immunity. B Cells; Major Histocompatibility Complex (MHC): Antigen Processing & Presentation; Adaptive Immunity. T Cells; Recognition & Response. Immune Signaling). **Immune System Out of Balance** (Introduction to the Immune System out of Balance; Types I-IV Hypersensitivities; Tolerance & Autoimmunity; Immunodeficiency Diseases; Cancer and the Immune System). **Immunotherapy: Harnessing the Immune System** (Vaccines and other Immunotherapies; Immune-Related Adverse Events (irAE)). **Immunologist's Toolbox** (Immune Diagnostics. Interrogating the Immune System). [Q22]
- [ ] [DB] CU Denver "Scientific Thinking" details, ten items: Think Like a Scientist: The Scientific Method and the Process of Discovery / Connect the Dots: Concept Mapping and Scientific Reasoning / Read Between the Lines: Critically Evaluating Scientific Literature / Beyond the Figure: Interpreting Scientific Visuals and Data / Design Discovery: Experimental Design and Scientific Inquiry / Make Sense of Data: Exploration, Analysis, and Interpretation / Find the Common Thread: Recognizing Patterns Across Scientific Studies / Evaluate Science: Peer Review, Grant Proposals, and Scientific Merit / Science in the Spotlight: Critically Evaluating Science in the Media / From Evidence to Understanding: Drawing Conclusions and Communicating Scientific Findings
- [ ] [CODE] Teacher Training Program card: link already works; swap photo [Q4]
- [ ] [CODE] "Communicating Your Science to the Public" card: link https://cctsi.cuanschutz.edu/training/communicating#ac-workshop-3-2; photo 'CCTSI' [Q5]. Closes BEN-1705.
- [ ] [CODE] Bottom: no cartoons, no movement in the white half circle above her name; make the half circle shorter. [Q20]
- Kept: "Building the next generation of teachers" section, the "Teaching the next generation of scientists" quote.

### Communicator
- [ ] [CODE] Large heading: "Translating science so people understand"
- [ ] [CODE] Top-right text: "Talks, keynote, and workshops to make science clear, honest, and authentic" ("keynote" as she wrote it, see Assumptions)
- [ ] [CODE] Hero photos: small TEDx photo on the left, same size; larger photo on the right, same size, a TEDx photo or an EDU THC photo. [Q6]
- [ ] [CODE] Big text below the photos becomes: "Science belongs to everyone. Through teaching, communication, and outreach, my goal is the same: to empower my audience to use science and evidence to make everyday decisions that positively impact their lives and their communities." She asks "Sound okay?" [Q18]
- [ ] [CODE] "By the Numbers" matches Home [Q19]
- [ ] [CODE] "Aimee regularly contributes to": four cards, keep the hover movement she loves: Immunology Explained (https://immunologyexplained.aai.org/); Science Crosstalk, her Substack (https://aimeepughbernard.substack.com/); Unbiased Science (https://www.unbiasedscience.com/the-team); @funsizeimmuninja, her Instagram (https://www.instagram.com/funsizeimmuninja/). Photo for one card: she offers two lab-coat photos, originals coming from Aimee via Alex [Q7]. Closes BEN-1706.
- [ ] [DB/CODE] TEDx feature stays. The "Read now" feature: a nice TEDx photo and a link to her Substack post https://aimeepughbernard.substack.com/p/confessions-of-a-scientist [Q8]
- [ ] [CODE] Bottom: same as Educator, with the alternative "maybe just have the blue immune cell and yellow antibody" [Q20]

### Outreach (today a "Coming Soon" page, BEN-1708)
- [ ] [CODE] Build the page with four program boxes and her intro: "Science belongs to everyone, and curiosity starts early. Aimee has helped create several outreach programs that bring hands-on science to students from elementary school through high school, and to the teachers and families who support them. Together, they help young people see themselves as scientists, explore careers in healthcare and research, and understand how science connects to their health and their communities. Each program is built on the belief that anyone can become a scientist."
- [ ] Think Like a Scientist (TLaS): free after-school program. Move the "Think Like a Scientist" black box here from the Immunologist page. Links: website tlasprogram.wordpress.com; YouTube "Science at Home"; curriculum on MERLOT (id 773470786); articles "Making science cool and fun", "Increasing Elementary Schooler's Access to Science", "Science Communicators Strategize How to Demystify Science".
- [ ] REACH (Raising Environmental Awareness for Community Health): five-week program on how the environment affects health. Links: YouTube "Solar Oven Pizza Box"; MERLOT curriculum (id 773469511).
- [ ] ECHO (Exploring Careers in Healthcare and Onward): career exploration for elementary and middle school students. Links: YouTube playlist; "The Lungs", "The Heart. Build Your Own Stethoscope", "Surgery. Make Your Own Surgeon's Knot Bracelet", "The Brain. Learn All About Reflexes"; MERLOT curriculum (id 773475218); one article (Ariel Davydov story).
- [ ] START (Students and Teachers Achieving Cancer Research Experiences Together): cancer research education with summer camps and mentored lab experiences. Links: program website; article "Start to learn about cancer research"; Core Concepts in Cancer Biology curriculum on MERLOT (id 824239760).
- [ ] [CODE] Remove the TLaS box from the Immunologist page when it moves. [Q24]
- [ ] Photos for each box [Q9]. Titles for article links [Q24].

### Contact
- [ ] [CODE] Heading "Let's connect." (today "Get in touch"), paragraph: "Have a talk, workshop, or collaboration in mind? Want to talk about teaching, science communication, or outreach? I'd love to hear from you. Send me a note and let's explore how we can share the wonder of science together."
- [ ] [CODE] Photo: `Aimee Pugh Bernard-444.png` (the vest portrait, received). Keep or drop the TEDx card on it? [Q25]
- Not in her audit but still open: the form doesn't send anything (BEN-1704).

### Immunologist (page file `web/src/pages/immunology.astro`)
Source: `audit-review/round2/WEBSITE AUDIT_Immunologist_APBernard.docx` (received 10/27; her screenshots are in `audit-review/round2/*_media/`). Her words in quotes.
- [ ] [CODE/DB] Opening text. Large: "Activating the immune system is like dialing 911". Small: "Your immune system works like a mobile defense force. When you get a cut, a splinter, or an infection, immune cells at the scene sense the damage and send out chemical distress signals, like a call to 911. Within minutes, those signals recruit immune cells to the site to fight germs, clear away debris, and start the repair." (Today's H1 is "Why the immune system is worth understanding".)
- [ ] [CODE] Opening photos: "Please remove the current photos and add the photos below". Left: her "Immune System" ambulance slide (`image1.png`). Right: the video still "Activating the Immune System is Like Dialing 911" (`image2.png`). "(I know it's a screenshot but don't have the original file to get a better photo – I like this one)". Both are screenshots, low resolution. [Q28]
- [ ] [CODE] Link the video still to https://immunologyexplained.aai.org/videos/how-your-immune-system-acts-like-dialing-911/ ("Can you link to the video below?").
- [ ] Her note on the tube photo: "Not a huge fan of the photo of me in a lab coat holding the tube. If we use it, please make it small". This overlaps with the lab-coat photo guesses already in place (tubes = hero and hover, per Alex 10/25). [Q29]
- [ ] [CODE/DB] Mission text. "I loved the text you drafted but I don't do bench science anymore and want to frame disease in a slightly different way." New text: "Every moment of every day, your immune system has to answer one question: friend or foe? It has to spot and attack real threats like viruses and bacteria while leaving your own healthy cells alone. That is much harder than it sounds, because invaders can look a lot like the body they're trying to break into. Most of the time, your immune system gets it right. But sometimes it gets confused. In allergies, it sounds the alarm over something harmless, like pollen or peanuts. In autoimmune diseases, it mistakes the body's own tissues for the enemy and attacks them." Closing line: "Aimee thinks the immune system is endlessly fascinating, and she hopes to inspire you to think so too!" Replaces today's "Every allergy, infection and autoimmune disease comes down to one question..." (`image3.png`). Keep the three cartoon icons? [Q30]
- [ ] [CODE/DB] "Q: Can you add the Teaching Awards here too? Above the mentoring awards?" Add the teaching awards section above "Mentoring and outreach, recognized." Awards already come from Sanity with an Award group (teaching / outreach & mentoring), so this is the same data shown a second time. [Q31]
- [ ] [DB] "1 small edit to outreach, mentoring and service awards – change text to 'TLaS Community Partner Spotlight Award'". Sanity item `contentItem-award-outreach-2026` is "Community Partner Spotlight Award" (venue "Aurora Public Schools"). [Q32]
- [ ] Publications: "LOVE all the publications!!" No change.
- [ ] [CODE] "REMOVE the Think Like a Scientist box from the bottom of this page. That makes more sense for Outreach." (Alex's earlier Outreach layout note applies: the TLaS box was already removed from Immunologist in commit 8d365d5, so check it is really gone from this branch.)
- [ ] [CODE] "What should we add instead? My Substack? Or can we add the immune cell pathogen fruit ninja like at the bottom of the Home page?" [Q33]

### Work (page file `web/src/pages/work.astro`)
Source: `audit-review/round2/WEBSITE AUDIT_Work Tab_APBernard.docx` (received 10/27). Her words in quotes.
- [ ] [CODE] "WORK – please make them plural 'Talks' etc." The filter tiles use singular labels (Talk, Course, Position, Award, Publication, Article, Podcast, Press, Educational Content, Social). Plural: Talks, Courses, Positions, Awards, Publications, Articles, Podcasts, Press (already plural), Educational Content, Socials ("Socials" is her own word further down). The card tag in `KIND_LABELS` is separate; plural applies to the tiles. [Q34]
- [ ] [DB] Talks: "Please add links to websites if available". Needs a pass over every talk with no link. Alex or Aimee supplies the links; I list which talks have none. [Q35]
- [ ] [DB] Duplicate: "'Your Shot at Protection: How Vaccines Work with the Immune System to Fight Disease' KEEP September 2023 Immunize Colorado and REMOVE duplicates (I've given this same talk ~6 times but just 1 on this page is fine)". In Sanity the title is "Your Shot at Protection. How Vaccines Train the Immune System to Fight Disease", two items: `contentItem-talk-019` (September 2023, venue "CU Alumni 'Healthy & Happy Hour'", YouTube link) and `contentItem-talk-015` (January 2022, Tattered Cover). Neither says "Immunize Colorado", so the one to keep is not clear. [Q36]
- [ ] [DB] Duplicate: "REMOVE 'Research Day Keynote Speaker' (screenshot on right) and KEEP other box with the link to the website (screenshot on left). Please edit title to 'Research Day Keynote. From Data to Dialogue: Research Communication for the Real World'". Kept item is `mlvUgjlufG0gMlJUjoYLLK` (today "2026 College of Health and Human Sciences Research Day Keynote, From Data to Dialogue: ...", Colorado State link). The other one has to be found and deleted. [Q37]
- [ ] [DB] Duplicate: "REMOVE 'From Data to Dialogue' (screenshot on right) and KEEP other box with link to the website (screenshot on left). Please edit title to 'myHub Career Development Retreat. From Data to Dialogue: Science Communication for the Real World' and add 'University of Rochester, October 2025' below with logo in top right corner". Kept item is `JjpsDhPX3u6UD60BLpZo9P` (link events.rochester.edu); remove `contentItem-talk-004` (October 2025, University of Rochester myHub). Set venue/date to "University of Rochester", "October 2025". Logo in the top right corner of the card: the University of Rochester logo is needed. [Q38]
- Courses, Positions, Awards, Podcasts: "added all to the dashboard". Socials: "added more to the dashboard". Nothing to build; counts will change (Award 6, Social 3 in her screenshot).
- Articles, Press, Educational Content: "not yet reviewed" / "net yet reviewed". Still coming from her. Talks: "Still reviewing and adding".
- [DB] Publications: "Please add journal and year to each publication – I am happy to add this info to the dashboard if missing. I am unable to edit any entries so may need altered access." [Q39]
- [DB] "Please remove the duplicate of 'A CREATE-ive Use of Primary Literature in the Science Classroom'". Two items: `3D2eTzEwbOdAIHeIqdwaRZ` (Neuroscience Letters, January 2021, PubMed link) and `contentItem-research-publication-002` (no venue or date). Delete the second and keep the first, since it has journal and date.
- [CODE+DB] "ADD a 'Books' section (the Parham book is a BIG deal)": "'The Immune System' Parham 6e, WW Norton" and "My Tiny Helpers". "KEEP them both under 'Educational content' but create a separate call out box for books please". "My Tiny Helpers" exists as an educational-content item (Lupe Science, https://lupe.science/books/). The Parham book is not in Sanity. This also answers the "does she have books?" blocker in `PLAN-ask-me-a-q-bot.md` (Q13): yes, two. [Q40]


## 2. Open questions (write your answer under each)

### Photos
**Q1 [RESOLVED]. Educator hero left photo and Home Educator hover.** She says "'EDU THC Antibody' or 'EDU THC Thymus'" for both. Her panel assignments are Antibody for Medical School and Graduate School, Thymus for PA and Dental. With the hero as well, the same two photos appear five times on one page. Which one for the hero and the Home hover, and is the repetition OK?
Answer:

**Q2 [RESOLVED, see log]. Immunologist hover photo ('need to curate').** Her 10/16 email says she still needs to pose "in a lab coat in a lab doing something cool." The Communicator document has a photo of her in a lab coat holding a tube. Is that the one, or is a new photo coming? Unplaced candidates in the folder: `EDU Aimee Immune Textbook2.JPG`, `EDU THC Cells.jpg`.
Answer:

**Q3 [RESOLVED]. CU Denver panel photo.** "Swap out photo – which one?" `SCI COMM DMRSEF Aimee.jpg` was taken at a University of Colorado Denver podium. Use it?
Answer:

**Q4 [RESOLVED]. Teacher Training card (Educator).** "Swap out photo," no name. Use 'TTP Aimee' as on Home?
Answer:

**Q5. CCTSI photo.** The file is the whole workshop slide: Anschutz logo plus a second person (Wendy Meyer). Use as is, crop to Aimee, or use another photo? (She asked to drop the Anschutz logo elsewhere, see Q26.)
Answer:

**Q6. Communicator hero photos.** Her words: "put small TEDx photo on the left and keep it same size. Please change larger photo to one of my TEDx photos (or EDU THC photos) and keep it same size and move it to the right." The small slot is portrait (448×640) and the large slot is landscape. Candidates: `SCI COMM TEDx scientist.heic` (portrait, 3548×5449), `SCI COMM TEDx front stage.jpg` (a lower-resolution version of the same shot), and the two landscape EDU THC photos. Which goes where? On phones only the first photo shows, so which one should that be?
Answer:

**Q7. "Contributes to" cards.** (a) [Waiting on originals from Aimee via Alex; photos not shown.] (b) Which card gets the lab-coat photo, and what photos for the other three? (c) Her four cards replace today's three. Are "The Immunology Podcast" and "The Conversation" dropped? (d) What role line under each name (today "Immunology Expert", "Guest Expert", "Contributing Author")?
Answer:

**Q8. "Read now" feature (Communicator).** Her words: "please change this to a nice photo from my TEDx talk and a link to my Science Crosstalk Substack about my TEDx talk." Is it the dark feature block under the TEDx section? It shows the most recently updated Science Communicator item today. Wire it to one Sanity item, or hard-code it? Which TEDx photo?
Answer:

**Q9. Outreach photos.** She gave none for the four boxes. TLaS has a photo (with "Think Like a Scientist / Ask a Scientist a Question" and an "Aimee (aka 'Scientist')" label burned in, which will crop badly). Photos for REACH, ECHO and START?
Answer:

**Q10. Photos she didn't mention.** `ABernard_STAR Award Photo_2023 copy.png`, `EDU THC Cells.jpg` (low resolution), `SCI COMM 031026 Research Day Keynote Speaker.jpg` (a Colorado State University flyer with their logos, not a photo), `EDU Aimee Immune Textbook2.JPG`, `SCI COMM TEDx front stage.jpg`. What are they for?
Answer:

**Q11. Image files.** `images/` is 45MB of originals. OK to optimize into web versions and not commit the originals?
Answer:

### Content and design
**Q12. Removing germs from the cast.** She says "REMOVE - Rhinovirus, Staph, E.coli (cute but want to focus more on immunology)", under the top-left cartoons. The footer game and the closing-area cartoons use those same germs. Remove them there too, or only from the top-left cast? And keep or remove interferon, which she didn't mention?
Answer:

**Q13. Chatbot.** Approved to build with demo scripts. I'll draft about 12 questions from the site content. She said "books, awards, writing": does she have books on the site? Should the bot also appear on phones, where the top right holds the menu button?
Answer:

**Q14. Static sections.** "Make the section below static under 'By the Numbers'…" and the same under "Trusted By/Appeared With." I read that as stacking normal sections instead of the pinned scroll-swap. Right? (This undoes the pin I adjusted on 10/13.)
Answer:

**Q15. Outreach and mentoring awards.** (a) Add her four to Sanity as `award` items so the Work page Award count (6 today) matches her "10"? (b) Do they replace the three placeholders on Immunologist (BEN-1703)? (c) The fourth says only "CU": which campus or school? (d) The new section has no small label above its heading (the existing one says "AWARD-WINNING EDUCATOR"). What should it say?
Answer:

**Q16. Awards stat.** She wrote "Awards received: 9+ (static number is fine – I'm at 10 now)." Use 9+ as written?
Answer:

**Q17. "All work" blue.** "change color surrounding arrow to blue." Use the site's existing light blue (the nav's active-pill blue)?
Answer:

**Q18. Communicator big text.** She asked "(Sound okay?)". The wording works. It's about 40 words as headline type, so about 9 lines on desktop. I'd keep the immune cell and antibody icons she loves on Educator (she said nothing about them here) and slightly reduce the type size. OK?
Answer:

**Q19. "Make the 'By the Numbers' match the 'Home' page."** Same numbers only, or the Home look too (large numbers in bordered thirds, plus the fourth stat)?
Answer:

**Q20. Bottom half circle (Educator and Communicator).** Educator: "Don't need the cartoons or movement of the white half circle above my name at the bottom – maybe make the half circle of white shorter." Communicator: "can we lose the movement of the bottom half circle and remove the cartoons? Or maybe just have the blue immune cell and yellow antibody (my 2 favorite)?" (a) What moves today is the cartoons, which drift with the cursor; the circle is still. Is that what she means, or the curve sliding as the footer scrolls in? (b) Zero cartoons, or just the blue cell and yellow antibody? (c) Apply to Immunologist too? (d) How much shorter?
Answer:

**Q21. Writing to Sanity.** The course tile order and icons, Graduate School labels and the new details, and the awards live in Sanity. OK to edit that live data directly, or do you want the changes as a seed script you run?
Answer:

**Q22. Fun-Size workshop structure.** Her list shows "IMMUNOTHERAPY Harnessing the Immune System" as a bullet, then two bullets under it, then "IMMUNOLOGIST'S TOOLBOX." I read the first as a group heading (so four groups). Right? (Empty bullets in her list are ignored.)
Answer:

**Q23. Graduate School "purple circles."** Today the panel has two pills: "Introduction to Immunology" and "Science Communication." She says "Where the courses are listed with little purple circles, please edit to 'Introduction to Science Communication'." Rename the second pill and leave Introduction to Immunology, or show only Science Communication?
Answer:

**Q24. Outreach details.** (a) Is the TLaS "website" for Home `tlasprogram.wordpress.com`? (b) What titles do the ECHO article link (Ariel Davydov story) and the YouTube links show? (c) Link out to YouTube and MERLOT, or embed videos? (d) Moving the TLaS box leaves Immunologist ending at Papers. OK? (e) The `/programs/think-like-a-scientist` and `/programs/teacher-training-program` placeholder pages would stay unlinked and no-index.
Answer:

**Q25. Contact.** Keep the TEDx talk card that sits on the photo? And where should form messages go (BEN-1704)?
Answer:

**Q26. CU Anschutz logo.** On Educator she says "We should remove the CU Anschutz logo (they are very protective of it!)". The same logo appears on the Work page cards (for CU and School of Medicine items), in the Home logo strip, and inside the CCTSI slide. Remove only the Educator chip, or everywhere?
Answer:


**Q27. Immunologist and Work.** Her 10/19 email said she'd review those on 10/20–10/21. No files came. Is that feedback truly done, or still coming?
Answer:

**Q27 (answered 10/27).** Both audits received. Immunologist and Work are now in section 1 above. Still coming from her: Articles, Press, Educational Content review, and more talks.

**Q28. Opening photos are screenshots.** She wants the ambulance slide (left) and the video still (right), and says she has no better originals. Use them as they are, or ask her for the slide file (the ambulance slide is a PowerPoint slide, so the original should exist)?
Answer: USE THEM AS THEY ARE (Alex, 10/27): "that is what she included in her email originally". Built: ambulance slide left, 911 video still right (linked to her video), shown whole, side by side.

**Q29. Tube photo.** "If we use it, please make it small." Is it still used anywhere on Immunologist once the two new photos go in, or only on Home (hero and hover)?
Answer: REMOVE FROM IMMUNOLOGIST; HOME HOVER USES THE SMILE PHOTO; DELETE THE TUBE PHOTO (Alex, 10/27). Built: tube photo removed from Immunologist and from Home (hover now the smile photo, changed in Sanity; backup `audit-review/sanity-backup-hover-immu-*.json`), web copies of the tube photo deleted (original stays in local `images/`). TELL AIMEE.

**Q30. Mission text icons.** The old sentence had three cartoon icons (cell, virus, antibody) inline. Her new text is longer and has no spots for them. Keep an icon or two inline, or plain text?
Answer: PARKED 10/27, waiting on Aimee. Four options shown to her: (1) today's sentence, (2) her full text at headline size (crowded, ~15 lines), (3) shorter 30-word version with the cells, (4) left/right: her opening question left in headline type with cells, detail paragraph + closing line right in body text. Screenshots: `audit-review/screenshots/q30-1` to `q30-5`. Nothing built.

**Q31. Teaching awards on Immunologist.** She asks "Can you add the Teaching Awards here too?" with a question mark. Show the same six most recent teaching awards as on Home and Educator?
Answer: NO, PUSH BACK (Alex, 10/27). Teaching awards stay on Educator and Home; each persona page keeps its own focus, Home is where everything blends, and visitors will see more than one page. Not built. TELL AIMEE: Alex is writing a short paragraph for his email.

**Q32. Award name.** "TLaS Community Partner Spotlight Award": rename the 2026 outreach award in Sanity (venue stays Aurora Public Schools)? "TLaS" is not spelled out anywhere on the card.
Answer: EXACTLY AS SHE WROTE (Alex, 10/27). Done in Sanity: "TLaS Community Partner Spotlight Award".

**Q33. What replaces the Think Like a Scientist box?** Her options: "My Substack" or the immune cell and pathogen game from the bottom of Home. Which one?
Answer: SUBSTACK BOX (Alex, 10/27). Built at the bottom of Immunologist: dark box, Substack collage, "Science Crosstalk / Where Science and Communication Collide.", button to her Substack.

**Q34. Plural filter labels.** Make only the filter tiles plural, or the tag on each card too (e.g. "Talks" on a single talk card would read oddly)?
Answer: TILES ONLY (Alex, 10/27). Built: Talks, Courses, Positions, Awards, Publications, Articles, Podcasts, Press, Educational Content, Socials.

**Q35. Missing talk links.** I will list every talk without a link. Who finds the links, Aimee in the dashboard or me?
Answer:

**Q36. Which "Your Shot at Protection" talk to keep.** She says keep "September 2023 Immunize Colorado". Sanity has September 2023 at "CU Alumni 'Healthy & Happy Hour'" (YouTube link) and January 2022 at Tattered Cover. Neither is Immunize Colorado. Keep the September 2023 one and change its venue to Immunize Colorado, or is the Immunize Colorado talk missing from the data?
Answer:

**Q37. Research Day Keynote.** I could not find the item she wants removed (the one titled "Research Day Keynote Speaker"). Is it one of the Sanity talks whose venue or title says "Keynote Speaker"? To confirm before deleting.
Answer:

**Q38. myHub card.** Venue "University of Rochester", date "October 2025", and the University of Rochester logo top right. Does Alex have the logo file, or use the existing outlet-logo mapping?
Answer:

**Q39. Publications access.** She cannot edit entries in the dashboard. Is that the dashboard (`/dashboard`) or Sanity Studio, and does she want to edit them herself or want me to fill in journal and year? Journal and year are missing from some publications.
Answer:

**Q40. Books box.** Placement on the Work page (above the cards, next to the kind tiles, or inside the Educational Content filter), and the Parham book needs a cover photo and link (publisher page?). "My Tiny Helpers" is already there (Lupe Science).
Answer:


## 3. Aimee's question: Dashboard vs code
She asked (10/19): "Let me know if any of the content within the documents needs to be added to the Dashboard… I am not sure what you can add vs. what needs to be in the Dashboard."

| Needs the Dashboard (Sanity) | We do in code |
|---|---|
| New awards (4) as award items | Home/Educator/Communicator/Contact text edits and the stats (static numbers) |
| Course tile order, panel photos, course details | Mascot cartoons, new cell art, "Ask me a Q?" bot |
| The featured TEDx item and the "Read now" item: photo and link | Home "Working on" cards, Outreach page, "contributes to" cards |
| Photos and links for Work items (e.g. a Science Crosstalk item) | Layout and spacing changes, bottom half-circle, icons |

Photos she's sending can come to us; we put them in. Nothing needs adding by her before we start.

## 4. Photo inventory (`images/`)
Matched to her names: EDU THC Antibody, EDU THC Thymus, SCI COMM TEDx scientist (HEIC), TLaS Aimee Ask a Q, TTP Aimee, FUNSIZE IG collage, SUBSTACK collage, CCTSI, HI3 fun size candy bag (984×692), Aimee Pugh Bernard-444 (Contact portrait).
Unplaced: see Q10. Still missing: the two lab-coat photos for Q7 (Alex getting them from Aimee) and the new Immunologist photo (Q2, Alex is making a composite).

## 5. Assumptions I'll act on unless told otherwise
- "Aime" in the Educator text is "Aimee".
- "keynote" in the Communicator text is "keynotes".
- Teacher Training link on Home uses her URL without `/overview`.
- "Top left cartoons" means the header mascot.
- Her numbers are static (she says "static number is fine"), not counted from the dashboard.

## 6. Linear
Covered by existing issues: BEN-1684/1697/1698 (bot), BEN-1688 (30+), BEN-1693 (Communicator media; its description still says "macrophage video"), BEN-1701 (content audit), BEN-1703 (awards), BEN-1704 (contact form), BEN-1705, BEN-1706, BEN-1707, BEN-1708. Not yet in Linear: new cartoons, Home restructure, Educator course changes, Outreach build, hero photo swaps.
