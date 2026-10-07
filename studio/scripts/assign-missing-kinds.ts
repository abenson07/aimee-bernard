/**
 * One-time fix: 34 contentItems were imported without a `kind`. This sets one
 * on each, matched by title, using the mapping reviewed with Aimee. Only items
 * that still have no kind are touched, so it is safe to re-run.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/assign-missing-kinds.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/assign-missing-kinds.ts
 *
 * Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN in the environment.
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

// Each rule: a lowercase fragment of the title, and the kind to assign.
const RULES: [string, string][] = [
  // research publications (PubMed papers)
  ["b cell antigen receptor signaling 101", "research-publication"],
  ["a new population of cells lacking expression of cd27", "research-publication"],
  ["b cell receptor signaling in human systemic lupus", "research-publication"],
  ["a strategy for the renovation of a clinical pathways", "research-publication"],
  ["rituximab improves peripheral b cell", "research-publication"],
  ["nkx2.2 regulates cell fate", "research-publication"],
  ["ghrelin cells replace insulin-producing", "research-publication"],
  // talks
  ["cu cancer center rising stars over the rockies", "talk"],
  ["myhub career development retreat", "talk"],
  ["faculty development in 5", "talk"],
  ["academy of medical educators grand rounds", "talk"],
  ["general internal medicine grand rounds", "talk"],
  ["adult infectious disease grand rounds", "talk"],
  ["research day keynote", "talk"],
  ["transforming healthcare lecture series. the future of immunotherapy", "talk"],
  ["tedxcu talk", "talk"],
  ["cancer research training and education coordination", "talk"],
  // educational content
  ["think like a scientist (tlas) outreach program", "educational-content"],
  ["cu anschutz basic science departments website", "educational-content"],
  ["teaching tool: aai-recommended", "educational-content"],
  ["does the number of recommended vaccines", "educational-content"],
  ["how does the immune system cause seasonal allergies", "educational-content"],
  ["how does your baby's immune system develop", "educational-content"],
  ["how do allergy shots work", "educational-content"],
  ["how research changed our approach to peanut allergy", "educational-content"],
  ["what happens when you have an allergic reaction", "educational-content"],
  ["activating your immune system is like dialing 911", "educational-content"],
  // press mentions
  ["cdc: colorado", "press-mentions"],
  ["cu anschutz today newsletter, transforming healthcare", "press-mentions"],
  // article
  ["science crosstalk substack", "article"],
  // position
  ["scientific advisory board member", "position"],
  // social
  ["instagram @funsizeimmuninja", "social"],
  ["tiktok @funsizeimmuninja", "social"],
  ["instagram @cuanschutz.biomedsci", "social"],
];

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

async function main() {
  const items: { _id: string; title: string }[] = await client.fetch(
    `*[_type == "contentItem" && !defined(kind)]{ _id, title }`,
  );
  console.log(`${items.length} items without a kind`);

  const plan = items.map((item) => {
    // If several rules match, the most specific (longest) fragment wins.
    const hit = RULES.filter(([frag]) => norm(item.title).includes(frag)).sort((a, b) => b[0].length - a[0].length);
    return { ...item, kind: hit.length ? hit[0][1] : null };
  });
  const unmatched = plan.filter((p) => !p.kind);
  for (const p of plan) console.log(`${p.kind ?? "??"}\t${p.title.slice(0, 90)}`);
  if (unmatched.length) {
    console.error(`\n${unmatched.length} item(s) matched no rule; nothing written.`);
    process.exit(1);
  }
  if (dryRun) {
    console.log("\nDry run: nothing written.");
    process.exit(0);
  }
  let tx = client.transaction();
  for (const p of plan) tx = tx.patch(p._id, { set: { kind: p.kind! } });
  await tx.commit();
  console.log(`\nWrote kind on ${plan.length} items.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
