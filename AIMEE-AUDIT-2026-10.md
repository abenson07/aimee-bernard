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
- Q2: resolved differently. Alex will make a composite of her in a lab coat. A base photo and an image prompt were provided in chat.
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
| 2 | Q22 Fun-Size: "Immunotherapy" as a group heading (four groups) | RESOLVED: four groups; going with Option A (groups as labeled blocks in the right-hand list). Fun-size candy bag photo applied. Option B saved to ask Aimee (see "Questions to ask Aimee") |
| 3 | Q16 Awards stat "9+" as written | RESOLVED: all four approved: label "Years as an Educator, Immunologist & Communicator" 25+, Courses taught 30+, Talks given 100+, new fourth stat Awards received 9+ |
| 4 | Q17 "All work" blue shade | RESOLVED: option B, #6aa8ff (T cell cartoon blue), text and arrow bigger. Applies to BOTH "All work" buttons: Home (`index.astro`) and Educator (`educator.astro`); a color scan of all 7 pages found no other yellow-green element. CSS in `home.css` and `educator.css` |
| 5 | Q11 optimize images, don't commit originals | RESOLVED: yes. Web-sized copies (desktop + phone sizes, about 200-600KB each), ALL converted to WebP including the HEIC. Originals stay local in `images/`, not committed |
| 6 | Q12 germs: top-left cast only; interferon | RESOLVED: remove rhinovirus, staph and E. coli from the top-left cartoon only; footer game stays as is; interferon stays (she didn't mention it) |
| 7 | Q14 "static" sections | RESOLVED (Alex): she means the numbers must be typed-in static numbers, not driven by the CMS. The pinned scroll-swap STAYS. Home stats are already typed in the page. Text edits built: "this" and "since 2011" removed. Org text "School of Medicine" is a Sanity change (the two 2023 awards say "CU School of Medicine"). Whether the awards section itself should be typed-in vs Sanity is settled in Q15 |
| 8 | Q19 Communicator numbers: numbers only or Home look | ASKED |
| 9 | Q21 OK to edit Sanity directly | RESOLVED: yes, edit Sanity. Blocker: no Sanity write token on this machine. Alex to put `SANITY_API_WRITE_TOKEN` in `studio/.env.local` (gitignored); never paste it in chat |
| 10 | Q26 CU Anschutz logo: chip only or everywhere | queued |
| 11 | Q13 bot: books, which pages, phone placement | queued |
| 12 | Q15 outreach awards (Sanity, placeholders, "CU", label) | queued |
| 13 | Q20 bottom half circle | queued |
| 14 | Q18 Communicator big text | queued |
| 15 | Q25 Contact TEDx card; form destination | queued |
| 16 | Q24 Outreach details | queued |
| 17 | Q6 Communicator hero photos | queued |
| 18 | Q7 "contributes to" cards (photo waits on Aimee's originals) | queued |
| 19 | Q8 "Read now" feature | queued |
| 20 | Q9, Q10 photos | queued |
| 21 | Q5 CCTSI slide | queued |
| 22 | Q27 Immunologist and Work audits | queued |

Resolved so far: Q1, Q2, Q3, Q4, Q11, Q12, Q14, Q16, Q17, Q21, Q22, Q23 (see log above).

Rule from Alex (10/24): where she named a photo and the file is in `images/`, just apply it; don't ask again. Applies to: Medical School, Graduate School = 'EDU THC Antibody'; PA, Dental = 'EDU THC Thymus'; Human Immunology = fun-size bag; Home cards TLaS / FUNSIZE IG / TTP / SUBSTACK; Home Communicator hover = 'SCI COMM TEDx scientist'; Contact portrait; Teacher Training = 'TTP Aimee'; CU Denver = DMRSEF.

## 0d. Questions to ask Aimee (collected as we go)
1. **Fun-Size workshop details layout (from Q22).** We're building Option A: her four groups as labeled blocks in the right-hand list of the one "Fun-Size Immunology Workshop" section. Option B: the four groups as purple-circle items on the left, each with its own section, like Graduate School. Which does she prefer? Screenshots (preview mocks): `audit-review/screenshots/q22-optionA-groups-in-right-list.png` and `q22-optionB-groups-as-left-items.png`. Her third group is written as a bullet ("IMMUNOTHERAPY Harnessing the Immune System"); we're treating it as a group heading.


## 0e. Build log (building happens as we go, per Alex 10/24)
Built, checked in the browser, committed locally (not pushed):
- B cell, dendritic cell and macrophage cartoons drawn and added to the header rotation with her exact lines (commit c8d71e4). Awaiting Alex's OK on the art.
- Header cartoon: rhinovirus, staph, E. coli removed (both `nav.js` and `shared.js`); influenza line now says "flu vaccine". Commit c033697.
- "See all" button on Home and Educator: new label, blue #6aa8ff, 76px tall with 24px text. Commit a35f911.
- Home By the Numbers: 25+ (new label), 30+, 100+, and a fourth stat "Awards received 9+"; four columns on desktop. Commit after a35f911.

Also built: Home headings ("this" and "since 2011" removed), commit 06b4790.

Approved but not built yet (waiting on the Sanity write token, or art): Graduate School pill and nine topics, Fun-Size four groups, panel photos, B cell / dendritic cell / macrophage cartoons, WebP image pipeline.

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

### Immunologist and Work
No audit received. [Q27]

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
