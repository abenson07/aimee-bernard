/**
 * One-time fix: 50 contentItems added Oct 12-23 2026 have no `kind`, so the Work
 * page skips them. This sets one on each where the title and description make it
 * clear (matched by the start of the title). Left alone on purpose:
 *   - "CU Anschutz Basic Science Departments website" and "Bridging Gaps in STEM
 *     with Science Outreach": exact duplicates of items that already have a kind.
 *   - "CU Academy of Medical Educators Faculty Development Workshop": talk or not?
 * Only items that still have no kind are touched, so it is safe to re-run.
 *
 * Usage (from studio/, with SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN set):
 *   ../node_modules/.bin/tsx scripts/assign-missing-kinds-oct.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/assign-missing-kinds-oct.ts
 */
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Each rule: a lowercase start of the title, and the kind to assign.
const RULES: [string, string][] = [
  // awards
  ["women in stem outstanding", "award"],
  ["cu chase faculty community service award", "award"],
  // podcasts (hosted or guest)
  ["help! make it make sense with dr. toni", "podcast"],
  ["the crazy career journey", "podcast"],
  ["how do we 'trust in science'", "podcast"],
  ["back to school starter pack", "podcast"],
  ["vaccines, trust, and tiny immune systems", "podcast"],
  ["a journey in science communication with", "podcast"],
  // talk
  ["breaking through the noise", "talk"],
  // articles and press
  ["making sense of science with a podcast", "article"],
  ["opinion:", "article"],
  ["vaccinations: your choice", "press-mentions"],
  ["aai news & views", "press-mentions"],
  // socials
  ["linkedin", "social"],
  ["threads @", "social"],
  ["bluesky @", "social"],
  // courses
  ["biol3", "course"],
  ["biol4", "course"],
  ["canb7600", "course"],
  ["immu7662", "course"],
  ["pubh6670", "course"],
  ["idpt7045", "course"],
  ["idpt8045", "course"],
  ["epid6634", "course"],
  ["mims6064", "course"],
  ["bmsc7810", "course"],
  ["core concepts in cancer biology for educators", "course"],
  // publications
  ["mhc class ii structural requirements", "research-publication"],
  ["from cold-agglutinin disease", "research-publication"],
  ["the dirt on hygiene", "research-publication"],
  ["lupus igg vh4.34", "research-publication"],
  ["reviving the sciences", "research-publication"],
  // positions
  ["marshal cu school of medicine", "position"],
  ["admissions chair", "position"],
  ["director biomedical sciences communication", "position"],
  ["member curriculum steering committee", "position"],
  ["academy of medical educators, legacy member", "position"],
  ["institute for science & policy symposium", "position"],
  ["honorary member golden key", "position"],
  ["member cancer research, training and education committee", "position"],
  ["facilitator, national institutes for scientific teaching", "position"],
];

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

async function main() {
  const items: { _id: string; title: string }[] = await client.fetch(
    `*[_type == "contentItem" && !defined(kind)]{ _id, title }`,
  );
  console.log(`${items.length} items without a kind`);

  const plan = items.map((item) => {
    // If several rules match, the most specific (longest) fragment wins.
    const hit = RULES.filter(([frag]) => norm(item.title).startsWith(frag)).sort((a, b) => b[0].length - a[0].length);
    return { ...item, kind: hit.length ? hit[0][1] : null };
  });
  for (const p of plan) console.log(`${p.kind ?? "-- skipped"}\t${p.title.slice(0, 90)}`);
  const todo = plan.filter((p) => p.kind);
  if (dryRun) {
    console.log(`\nDry run: would set kind on ${todo.length}, skip ${plan.length - todo.length}.`);
    return;
  }
  let tx = client.transaction();
  for (const p of todo) tx = tx.patch(p._id, { set: { kind: p.kind! } });
  await tx.commit();
  console.log(`\nWrote kind on ${todo.length} items; ${plan.length - todo.length} left alone.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
