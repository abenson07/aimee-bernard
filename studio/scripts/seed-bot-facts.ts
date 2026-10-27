/**
 * Loads the Ask bot's hand-written facts and social links (web/src/data/aimee-facts.ts) into Sanity
 * as "Bot fact" and "Bot social link" documents, so Aimee can edit them in Studio.
 *
 * Dry run by default (reads only, prints what would be written). Add --apply to write.
 * Before writing, it saves a backup of any bot documents already in the dataset to ../audit-review/.
 * It only creates or replaces documents with its own ids (botFact-<id>, botSocial-<id>); it never
 * deletes anything, and re-running it resets those documents to the versions in code.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/seed-bot-facts.ts            # dry run
 *   ../node_modules/.bin/tsx scripts/seed-bot-facts.ts --apply    # write
 *
 * Reads SANITY_API_WRITE_TOKEN from studio/.env.local (never printed) and the project id and
 * dataset from ../web/.env.
 */
import { createClient } from "@sanity/client";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FACTS, SOCIALS } from "../../web/src/data/aimee-facts";

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

/** The code file writes phrases as small patterns like "how do i (contact|reach) (her|aimee)". Studio holds plain phrases, so spell each one out. */
function expand(pattern: string): string[] {
  const m = pattern.match(/\(([^()]*)\)/);
  if (!m) return [pattern];
  const options = m[1].split("|");
  return options.flatMap((o) => expand(pattern.slice(0, m.index) + o + pattern.slice((m.index ?? 0) + m[0].length)));
}

const titleCase = (id: string) => id.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const factDocs = FACTS.map((f) => ({
  _id: `botFact-${f.id}`,
  _type: "botFact",
  title: titleCase(f.id),
  phrases: [...new Set(f.match.flatMap(expand))],
  answer: f.answer,
  ...(f.links?.length ? { links: f.links.map((l, i) => ({ _key: `l${i}`, _type: "botLink", label: l.label, url: l.href })) } : {}),
}));
const socialDocs = SOCIALS.map((s) => ({ _id: `botSocial-${s.id}`, _type: "botSocial", label: s.label, handle: s.handle, url: s.href, words: s.words }));
const docs: ({ _id: string; _type: string } & Record<string, unknown>)[] = [...factDocs, ...socialDocs];

async function main() {
  console.log(`Dataset ${projectId}/${dataset}. ${factDocs.length} facts and ${socialDocs.length} social links from aimee-facts.ts:\n`);
  for (const d of docs) console.log(`  ${d._id}`);

  const ids = docs.map((d) => d._id);
  const existing = await client.fetch<{ _id: string }[]>(`*[_type in ["botFact","botSocial"] || _id in $ids || _id in $draftIds]`, { ids, draftIds: ids.map((i) => `drafts.${i}`) });
  console.log(`\nAlready in Sanity: ${existing.length} bot documents${existing.length ? " (they will be replaced if their id matches)" : ""}.`);

  if (!apply) return console.log("\nDry run complete. Re-run with --apply to write.");

  const dir = join(here, "../../audit-review");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `bot-facts-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(existing, null, 2));
  console.log(`\nBackup saved: ${file}`);

  let tx = client.transaction();
  for (const d of docs) tx = tx.createOrReplace(d);
  await tx.commit();
  console.log(`Wrote ${docs.length} documents.`);
}

main().catch((err) => {
  console.error(String(err?.message ?? err));
  process.exit(1);
});
