# Content Classification Guide — aimeepughbernard.com

Instructions for an agent categorizing a piece of Aimee Pugh Bernard's content into one of four site personas: **Immunologist**, **Educator**, **Science Communicator**, **Community Outreach**.

---

## Core principle

**Classify by the job the content does, not by what it's about.**

Nearly everything she's made is about immunology, teaching, or communicating science. Topic will not separate these categories — it will send you to the wrong one. The separator is:

> Who sees this, and what do they now believe or do because of it?

Every category answers a different question that a different reader arrives with. Match the content to the question it answers.

| Category | Reader's question | What the content must prove |
|---|---|---|
| Immunologist | "Is she a real scientist? Can I trust her on this?" | Rigorous scientific training and standing in the field |
| Educator | "What does a scientist who chooses teaching actually look like?" | Teaching is a serious career and she's a recognized leader in it |
| Science Communicator | "Who do I book, hire, or learn sci comm from?" | She's a trusted public messenger and a sci comm leader worth connecting with |
| Community Outreach | "Why leave the lab? / What can I run with my kids or students?" | Community connection is fulfilling, and here's usable programming |

---

## Decision procedure

Run in order. Stop at the first rule that fires.

1. **Who is the intended reader?**
   - Immunology peers or trainees evaluating her expertise → candidate: **Immunologist**
   - Academics curious about teaching as a career → candidate: **Educator**
   - The general public, or scientists seeking a sci comm speaker/trainer → candidate: **Science Communicator**
   - K–12 teachers, parents, kids, or scientists wanting to start outreach → candidate: **Community Outreach**

2. **What does the reader do next?**
   - Trusts her scientific judgment → Immunologist
   - Sees a career path modeled, or adopts a teaching practice → Educator
   - Follows, subscribes, invites her to speak, or books a workshop → Science Communicator
   - Runs a program, uses a curriculum, or starts their own outreach → Community Outreach

3. **If two still fit, use the tiebreakers below.** If two genuinely fit, that's fine — record both (see Multi-label).

4. **If nothing fits**, return `unclassified` with a note. Do not force a category.

---

## Tiebreakers

These are the ambiguities that actually come up.

**Immunologist vs. Educator**
- Is the content *immunology itself* (research findings, subject-matter authorship)? → **Immunologist**
- Is the content *about how immunology gets taught* (pedagogy, curriculum design, training educators)? → **Educator**
- A peer-reviewed paper can land in either — the AAI guidelines paper is peer-reviewed but is about medical school teaching, so it's Educator.

**Educator vs. Science Communicator**
- Audience is inside academia and is being *taught* → **Educator**
- Audience is outside academia and is *receiving science* → **Science Communicator**
- Scientists being trained in sci comm → both. Primary is **Science Communicator** if the artifact establishes her authority as a sci comm leader (a workshop she runs, a talk she gives); primary is **Educator** if the emphasis is curriculum, course structure, or pedagogy.

**Science Communicator vs. Community Outreach**
- Does the reader *receive* the communication (post, article, talk, video)? → **Science Communicator**
- Does the reader *use or replicate* something (program, curriculum, experiment, event)? → **Community Outreach**
- Outreach content is tied to a named program with a defined community; sci comm content is broadcast to an undefined audience.

**Immunologist vs. anything else**
- Default is *not* Immunologist. That category is narrow on purpose — it exists to establish scientific credibility. Only route here when the content's primary job is proving research chops. If immunology is present but the job is teaching, communicating, or outreach, it belongs elsewhere.

---

## Multi-label

Overlap is expected and Aimee flagged it herself. Rules:

- Assign one **primary** category (drives placement and voice).
- Assign **secondary** categories only when the content independently does that category's job — not just because it's tangentially related.
- Cap at two categories. Three means the classification is too loose; re-run the decision procedure.
- Known overlaps to expect:
  - *Parham The Immune System* 6th ed. → Immunologist (primary) + Educator
  - CCTSI 'Communicating Your Science' workshops → Science Communicator (primary) + Educator

---

## Voice per category

Use when generating or adapting copy for the classified item.

- **Immunologist** — knowledgeable, serious, precise. No hype.
- **Educator** — dedicated, award-winning, infectious enthusiasm. Warmer than Immunologist.
- **Science Communicator** — passionate, trusted, plain-language. Simplified without being scary or condescending.
- **Community Outreach** — inspiring, engaging, invitational.

---

## Framing constraints

Each category has a failure mode if the content is written as though it's the only thing she does. When writing blurbs or summaries, avoid these implications:

- **Immunologist** — don't imply she's still at the bench. She moved into teaching, sci comm, and outreach in 2007.
- **Educator** — don't imply her reach stops at the classroom.
- **Science Communicator** — don't imply she communicates *instead* of doing science. She has deep research training; the "failed scientist turned communicator" read is wrong and she's sensitive to it.
- **Community Outreach** — don't imply outreach is a side hobby separate from her work as a medical educator.

---

## Output format

```json
{
  "title": "string",
  "url": "string | null",
  "primary_category": "immunologist | educator | science_communicator | community_outreach | unclassified",
  "secondary_categories": ["..."],
  "audience": "who this is for, one line",
  "job_to_be_done": "what the reader believes or does after seeing it, one line",
  "confidence": "high | medium | low",
  "rationale": "which decision rule fired and why",
  "flags": ["ambiguous", "needs_human_review", "..."]
}
```

Set `confidence: low` and flag `needs_human_review` when:
- The decision procedure reached step 3 and the tiebreaker was close
- The content would fit three or more categories
- The intended audience can't be determined from the content itself

---

## Worked examples

| Content | Primary | Secondary | Why |
|---|---|---|---|
| 2001 *JCI* research article | Immunologist | — | Subject-matter research output; job is proving scientific rigor |
| AAI guidelines for immunology in med schools | Educator | — | Immunology topic, but the job is about how it's taught |
| *Parham The Immune System*, 6th ed. | Immunologist | Educator | Authored as subject expert (credibility) and it's a teaching object |
| TEDxCU talk on sci comm | Science Communicator | — | Public-facing, positions her as a sci comm leader and speaker |
| Teacher Training Program (TTP) | Educator | — | Trains educators; audience is inside academia |
| @funsizeimmuninja social content | Science Communicator | — | Broadcast to the public; reader receives, doesn't replicate |
| TLaS published curriculum | Community Outreach | — | Reader *uses* it to run a program |
| CCTSI 'Communicating Your Science' workshops | Science Communicator | Educator | Establishes sci comm authority; also a teaching artifact |
| CU Anschutz Basic Sciences website | Science Communicator | — | Translating campus science for non-academic audiences |
| Teaching awards (CU Denver, CU Anschutz) | Educator | — | Evidence of recognized leadership in teaching |
