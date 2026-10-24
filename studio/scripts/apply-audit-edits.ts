/**
 * Applies the Sanity changes from Aimee's website audit (October 2026):
 *  - the two 2023 School of Medicine awards read "School of Medicine"
 *  - course tile order, icons and panel photos
 *  - Graduate School: second pill becomes "Introduction to Science Communication", plus its nine topics
 *  - Human Immunology (Fun-Size workshop): four headed groups of topics
 *  - CU Denver "Scientific Thinking": ten topics
 *
 * Dry run by default (reads only, prints what would change). Add --apply to write.
 * Before writing, it saves a backup of every document it will touch to ../audit-review/.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/apply-audit-edits.ts            # dry run
 *   ../node_modules/.bin/tsx scripts/apply-audit-edits.ts --apply    # write
 *
 * Reads SANITY_API_WRITE_TOKEN from studio/.env.local (never printed) and the project id and
 * dataset from ../web/.env.
 */
import { createClient } from "@sanity/client";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes("--apply");

function loadEnv(file: string): Record<string, string> {
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = { ...loadEnv(join(here, "../../web/.env")), ...loadEnv(join(here, "../.env.local")), ...process.env } as Record<string, string | undefined>;
const projectId = env.SANITY_PROJECT_ID ?? env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.SANITY_DATASET ?? env.PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_WRITE_TOKEN;
if (!projectId) throw new Error("No Sanity project id found (web/.env).");
if (apply && !token) throw new Error("--apply needs SANITY_API_WRITE_TOKEN in studio/.env.local.");

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token: apply ? token : undefined, useCdn: false });

const photos = join(here, "../../web/public/site/photos");
const PHOTO = {
  antibody: join(photos, "edu-thc-antibody-1600.webp"),
  thymus: join(photos, "edu-thc-thymus-1600.webp"),
  bag: join(photos, "fun-size-bag-984.webp"),
  dmrsef: join(photos, "dmrsef-panel-1600.webp"),
};

// ---- the new content, in Aimee's words ----
const SCICOMM_TOPICS = [
  "Strategies for Effective Science Communication",
  "Science Writing That Makes an Impact: From Op-Eds to Blogs and Beyond",
  "The Art of Science Storytelling: Turning Your Science and Research into Compelling Stories",
  "The Power of 60 Seconds: Crafting a Memorable Elevator Pitch",
  "Navigating Challenging Conversations",
  "Beyond Words: The Art and Science of Visual Communication",
  "Expanding Your Reach with Social Media",
  "Strategies for Successful Media Interviews",
  "The Voices of Science: Conversations with Professional Communicators",
];
// A topic starting with "# " is shown as a small group heading (see CourseGroups.astro).
const FUNSIZE_TOPICS = [
  "# Immune System in Balance",
  "Cells, Organs and Microenvironments of the Immune System",
  "Innate Immunity and the Complement System",
  "Adaptive Immunity. B Cells",
  "Major Histocompatibility Complex (MHC): Antigen Processing & Presentation",
  "Adaptive Immunity. T Cells",
  "Recognition & Response. Immune Signaling",
  "# Immune System out of Balance",
  "Introduction to the Immune System out of Balance",
  "Types I-IV Hypersensitivities",
  "Tolerance & Autoimmunity",
  "Immunodeficiency Diseases",
  "Cancer and the Immune System",
  "# Immunotherapy: Harnessing the Immune System",
  "Vaccines and other Immunotherapies",
  "Immune-Related Adverse Events (irAE)",
  "# Immunologist’s Toolbox",
  "Immune Diagnostics. Interrogating the Immune System",
];
const SCIENTIFIC_THINKING_TOPICS = [
  "Think Like a Scientist: The Scientific Method and the Process of Discovery",
  "Connect the Dots: Concept Mapping and Scientific Reasoning",
  "Read Between the Lines: Critically Evaluating Scientific Literature",
  "Beyond the Figure: Interpreting Scientific Visuals and Data",
  "Design Discovery: Experimental Design and Scientific Inquiry",
  "Make Sense of Data: Exploration, Analysis, and Interpretation",
  "Find the Common Thread: Recognizing Patterns Across Scientific Studies",
  "Evaluate Science: Peer Review, Grant Proposals, and Scientific Merit",
  "Science in the Spotlight: Critically Evaluating Science in the Media",
  "From Evidence to Understanding: Drawing Conclusions and Communicating Scientific Findings",
];

type Doc = Record<string, any> & { _id: string; _type: string };
const patches: { id: string; label: string; set: Record<string, unknown> }[] = [];
const plan = (id: string, label: string, set: Record<string, unknown>) => patches.push({ id, label, set });

async function main() {
  console.log(apply ? "APPLY mode: writing to Sanity.\n" : "DRY RUN: nothing will be written.\n");

  // ---- awards ----
  const awards = await client.fetch<Doc[]>(`*[_type == "contentItem" && kind == "award"]{ _id, _type, title, venue, date }`);
  for (const a of awards) if (a.venue === "CU School of Medicine") plan(a._id, `award "${a.title}" (${a.date}): venue "CU School of Medicine" -> "School of Medicine"`, { venue: "School of Medicine" });

  // ---- course topics ----
  const courses = await client.fetch<Doc[]>(`*[_type == "contentItem" && kind == "course"]{ _id, _type, title, venue, topics }`);
  const one = (start: string) => {
    const hits = courses.filter((c) => (c.title as string).startsWith(start));
    if (hits.length !== 1) throw new Error(`Expected one course starting "${start}", found ${hits.length}`);
    return hits[0];
  };
  const sci = one("MIMS6062"), fun = one("Fun-Size Immunology Workshop"), denver = one("UNHL4820");
  plan(sci._id, `course "${sci.title}": ${sci.topics?.length ?? 0} topics -> ${SCICOMM_TOPICS.length}`, { topics: SCICOMM_TOPICS });
  plan(fun._id, `course "${fun.title}": ${fun.topics?.length ?? 0} topics -> ${FUNSIZE_TOPICS.length} (4 headed groups)`, { topics: FUNSIZE_TOPICS });
  plan(denver._id, `course "${denver.title}": ${denver.topics?.length ?? 0} topics -> ${SCIENTIFIC_THINKING_TOPICS.length}`, { topics: SCIENTIFIC_THINKING_TOPICS });

  // ---- course groups ----
  const groups = await client.fetch<Doc[]>(`*[_type == "courseGroup"]{ _id, _type, name, order, icon, tags, "hasImage": defined(image) }`);
  const g = (id: string) => {
    const hit = groups.find((x) => x._id === id);
    if (!hit) throw new Error(`Missing ${id}`);
    return hit;
  };
  const desired: Record<string, { order: number; icon?: string; photo: keyof typeof PHOTO; tags?: string[] }> = {
    "courseGroup-som": { order: 1, icon: "stethoscope", photo: "antibody" },
    "courseGroup-cha": { order: 2, icon: "medical-bag", photo: "thymus" },
    "courseGroup-grad": { order: 3, photo: "antibody", tags: ["Introduction to Immunology", "Introduction to Science Communication"] },
    "courseGroup-hi3": { order: 4, icon: "vaccine-heart", photo: "bag" },
    "courseGroup-dent": { order: 5, photo: "thymus" },
    "courseGroup-denver": { order: 6, photo: "dmrsef" },
  };

  // upload each distinct photo once
  const assetIds: Partial<Record<keyof typeof PHOTO, string>> = {};
  for (const key of new Set(Object.values(desired).map((d) => d.photo))) {
    if (apply) {
      const asset = await client.assets.upload("image", createReadStream(PHOTO[key]), { filename: PHOTO[key].split("/").pop() });
      assetIds[key] = asset._id;
    } else assetIds[key] = `(would upload ${PHOTO[key].split("/").pop()})`;
  }

  for (const [id, d] of Object.entries(desired)) {
    const cur = g(id);
    const set: Record<string, unknown> = { order: d.order, image: { _type: "image", asset: { _type: "reference", _ref: assetIds[d.photo] } } };
    if (d.icon) set.icon = d.icon;
    if (d.tags) set.tags = d.tags;
    const bits = [`order ${cur.order} -> ${d.order}`];
    if (d.icon) bits.push(`icon ${cur.icon} -> ${d.icon}`);
    if (d.tags) bits.push(`tags ${JSON.stringify(cur.tags)} -> ${JSON.stringify(d.tags)}`);
    bits.push(`photo ${cur.hasImage ? "replaced" : "set"}: ${PHOTO[d.photo].split("/").pop()}`);
    plan(id, `group "${cur.name}": ${bits.join("; ")}`, set);
  }

  // ---- report ----
  patches.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.label}`));
  const drafts = await client.fetch<string[]>(`*[_id in path("drafts.**") && _id in $ids]._id`, { ids: patches.map((p) => `drafts.${p.id}`) });
  if (drafts.length) console.log(`\nWARNING: unpublished drafts exist for ${drafts.join(", ")}. Studio would show the draft over these edits.`);

  if (!apply) return console.log("\nDry run complete. Re-run with --apply to write.");

  // ---- backup, then write ----
  const ids = patches.map((p) => p.id);
  const before = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids });
  const dir = join(here, "../../audit-review");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `sanity-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(before, null, 2));
  console.log(`\nBackup saved: ${file}`);

  let tx = client.transaction();
  for (const p of patches) tx = tx.patch(p.id, (patch) => patch.set(p.set));
  await tx.commit();
  console.log(`Wrote ${patches.length} documents.`);
}

main().catch((err) => {
  console.error(String(err?.message ?? err));
  process.exit(1);
});
