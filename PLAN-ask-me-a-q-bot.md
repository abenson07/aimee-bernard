# Plan: the "Ask me a Q?" B cell bot

Status: draft for review, 2026-10-24. Nothing is built. Related Linear: BEN-1684 (parent), BEN-1697 (scripted bot), BEN-1698 (featured-content controls).

## 1. What she asked for
From her Opening audit, word for word:
> "Top right chatbot – B cell with “Ask me a Q?” sign that is preprogrammed – NEED TO CREATE set of questions to help explore the website (books, awards, writing…)"

From Linear BEN-1697 (her earlier feedback): a cell-themed search interaction using scripted keyword matching, not a generative AI chatbot; she wants simplicity and no per-use AI costs, with the Vera COVID-19 chatbot as inspiration; questions about podcasts or talks should return a few relevant content options from the dashboard-backed Work content. BEN-1698: she wants the TEDx talk highlighted, with Immunology Explained and Substack also discussed.

Alex's decisions (10/24): yes, build it; write demo scripts.

## 2. What exists today
- The top-left header cartoon already talks in speech bubbles from a cast list in `web/src/scripts/shared.js` (T cell, neutrophil, etc., each with short lines). The B cell cartoon she asked for (H1) is the same character the bot would use.
- Top right on desktop is empty. On phones the top right is the menu button.
- Work items (talks, podcasts, press, articles, awards…) are in Sanity and already loaded for the Work page.

## 3. The experience
1. **Entry point:** a small B cell holding a sign that reads "Ask me a Q?", top right on desktop. It bobs gently like the header mascot. On phones it sits just left of the menu button.
2. **Opening it:** click or tap opens a small panel (a bottom sheet on phones) with the B cell's greeting ("Hi! I'm a B cell. I make antibodies. Ask me about Aimee!") and 6 to 8 tappable question chips, plus a text box.
3. **Answers:** a short in-character answer, plus up to three link buttons (page, talk, article) and 2 to 3 follow-up chips ("Where can I watch it?").
4. **Typed questions:** matched to the closest scripted question. If nothing matches well: "I don't know that one! Try one of these, or send Aimee a note" with chips and a Contact link.
5. **Health questions:** the bot stays in its lane. "I'm a B cell, not a doctor," then a pointer to her Work page of educational content.
6. **Accessibility:** keyboard operable, focus moves into the panel and returns on close, Escape closes, answers announced politely, respects reduced motion.

## 4. How answers are chosen (no AI, no cost)
- **Script file:** `web/src/data/ask-script.ts`, an array of entries: id, example questions, keywords and synonyms, answer text, link buttons, follow-up ids.
- **Matching:** lowercase, strip punctuation, drop filler words, score by keyword hits and question overlap, with synonyms ("speak/talk/keynote", "writing/articles/blog/substack"). A threshold decides match versus fallback.
- **Live lists:** for "talks", "podcasts", "press", "articles", the bot reads a compact index of Work items (title, kind, venue, date, link) from a small cached endpoint, fetched the first time the panel opens. Featured items (the TEDx talk first) are listed first. Until the featured toggle exists (BEN-1698), the TEDx talk is hard-coded to the top.
- **Content ownership:** the script lives in code for now. Moving it into the dashboard is a later phase.

## 5. Draft script for the demo
Every fact below comes from her documents or the site as they stand. Anything new is marked **(new copy, Aimee approves)**. Answers are in the B cell's voice.

| Question chips | Answer (draft) | Links |
|---|---|---|
| Who is Aimee? | "Aimee is a published immunologist! She studied B cell development and autoimmunity for her PhD. She's also taught for 25+ years and loves making science make sense." | Immunologist page |
| What does she teach? | "Since 2007 she's taught 30+ courses, from first-year medical students and PhD trainees to faculty and community members." | Educator page |
| Where can I see her talk? | "Her TEDxCU talk is 'Confessions of a Scientist: Science education needs communication training.' Hit play!" | TEDx video, Communicator page |
| Can I book her for a talk or workshop? | "Yes! Talks, keynotes, and workshops to make science clear, honest, and authentic. Send her a note." | Contact |
| What awards has she won? | "She's received 10 awards: teaching awards since 2011, plus recognition for mentoring and community outreach." **(awards list pending, BEN-1703)** | Home awards, Educator awards |
| Does she write? | "Yes! Her Substack is Science Crosstalk, where science and communication collide. She's also contributed to The Conversation and Immunology Explained." | Substack, Work (articles) |
| Where can I hear her on a podcast? | Live list of her podcast items from Work. | Work filtered to Podcast |
| What is Fun Size Immuninja? | "Her Instagram, @funsizeimmuninja, bite-size immunology. There's also a Fun-Size Immunology Workshop." | Instagram, Educator panel |
| What outreach does she do? | "Four programs for students and teachers: Think Like a Scientist (TLaS), REACH, ECHO and START. Each is built on the belief that anyone can become a scientist." | Outreach page |
| What is Think Like a Scientist? | "A free after-school science program where CU Anschutz volunteer scientists and students lead elementary students through hands-on experiments." | Outreach page, TLaS website |
| Does she teach science communication? | "Yes! She directs Introduction to Science Communication in the Graduate School, and co-directs the CCTSI 'Communicating Your Science to the Public' workshops." | Educator, CCTSI page |
| Where does she teach? | "At CU Anschutz and CU Denver." (text only) | Educator |
| What's a B cell? (fun) | "That's me! I make antibodies. B cells mature in the bone marrow, and each of us recognizes one specific antigen. Some of us turn into memory cells and stick around for years." (her own B cell lines) | none |
| What's a vaccine? (fun) | Uses the vaccine cartoon's lines from the cast ("I show your immune system a harmless preview of a germ…") | none |
| Does she have books? | **Unknown. She wrote "books" in her note. Waiting on Aimee (see Q13).** | |

## 6. Build outline
1. **Art:** B cell holding a sign, in the style of the existing cartoons (the same character as H1). Needs your approval first.
2. **Shell:** bot button and panel in `SiteHeader.astro`, `src/scripts/ask-bot.js`, styles in `nav.css`. Phone placement left of the menu button, panel as a bottom sheet. Must not clash with the hold-to-play game on Home or the Work filter dock (z-index and bottom space).
3. **Script and matching:** `ask-script.ts` with the table above, plus the matcher.
4. **Work index endpoint:** a small cached read of Work items for the live lists.
5. **Test:** 30 typed phrasings against the script, keyboard walk-through, phone widths, screen reader pass.
6. **Later:** featured toggle in the dashboard (BEN-1698), script editable in the dashboard.

Rough size: art plus shell is the bulk of the first demo. A clickable demo with chips only (no typing) is the fastest first step.

## 7. Decisions to make
- Where should the bot sit on phones (next to the menu button, or a floating bubble)?
- Does she have books to include (her word "books")?
- Should it appear on every page, or only Home?
- Is the B cell's voice right, or should it answer as Aimee?
- Do we ship the typing box in the demo, or chips only?
