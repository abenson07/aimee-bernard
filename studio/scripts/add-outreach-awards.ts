/**
 * Adds an "Award group" to the awards (the six existing ones become "teaching") and creates
 * Aimee's four outreach & mentoring awards (from her Opening audit document).
 * Dry run by default; add --apply to write (saves a backup of the six existing awards first).
 *
 *   ../node_modules/.bin/tsx scripts/add-outreach-awards.ts [--apply]
 */
import { createClient } from "@sanity/client";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes("--apply");
function loadEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = { ...loadEnv(join(here, "../../web/.env")), ...loadEnv(join(here, "../.env.local")), ...process.env } as Record<string, string | undefined>;
const client = createClient({
  projectId: env.SANITY_PROJECT_ID ?? env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET ?? env.PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: apply ? env.SANITY_API_WRITE_TOKEN : undefined,
  useCdn: false,
});

const NEW_AWARDS = [
  { id: "contentItem-award-outreach-2026", title: "Community Partner Spotlight Award", venue: "Aurora Public Schools", date: "2026" },
  { id: "contentItem-award-outreach-2024", title: "CU Women in STEM Mentorship Award", venue: "CU Anschutz", date: "2024" },
  { id: "contentItem-award-outreach-2023", title: "CU Women in STEM Community Service Award", venue: "CU Anschutz", date: "2023" },
  { id: "contentItem-award-outreach-2022", title: "Chase Faculty Community Service Award", venue: "CU", date: "2022" },
];

async function main() {
  console.log(apply ? "APPLY mode.\n" : "DRY RUN.\n");
  const existing: any[] = await client.fetch(`*[_type == "contentItem" && kind == "award" && !(_id in path("drafts.**"))]`);
  const cat: { _id: string } | null = await client.fetch(`*[_type == "category" && name == "Community Outreach"][0]{ _id }`);
  if (!cat) throw new Error('No "Community Outreach" category found.');

  const toGroup = existing.filter((a) => !a.awardGroup && !a._id.startsWith("contentItem-award-outreach-"));
  toGroup.forEach((a) => console.log(`set awardGroup "teaching": ${a.date} ${a.title}`));
  NEW_AWARDS.forEach((n) => console.log(`create award (outreach): ${n.date} ${n.title} | ${n.venue}  [${existing.some((a) => a._id === n.id) ? "already exists, will update" : "new"}]`));
  if (!apply) return console.log("\nDry run complete. Re-run with --apply to write.");

  const dir = join(here, "../../audit-review");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `sanity-backup-awards-${Date.now()}.json`), JSON.stringify(existing, null, 2));
  let tx = client.transaction();
  for (const a of toGroup) tx = tx.patch(a._id, (p) => p.set({ awardGroup: "teaching" }));
  for (const n of NEW_AWARDS) {
    tx = tx.createIfNotExists({ _id: n.id, _type: "contentItem", kind: "award", title: n.title, venue: n.venue, date: n.date, awardGroup: "outreach", category: { _type: "reference", _ref: cat._id } });
    tx = tx.patch(n.id, (p) => p.set({ title: n.title, venue: n.venue, date: n.date, awardGroup: "outreach" }));
  }
  await tx.commit();
  console.log("\nDone. Backup of the existing awards saved in audit-review/.");
}
main().catch((e) => { console.error(String(e?.message ?? e)); process.exit(1); });
