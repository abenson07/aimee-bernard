/**
 * Fun-Size workshop: turn the four "# " headed groups into four sections (Option B).
 * Each group becomes a courseYear with its own topics; the workshop item's own topic
 * list goes back to a flat list. Backup is written to audit-review/.
 *
 *   ../node_modules/.bin/tsx scripts/split-funsize-groups.ts            # dry run
 *   ../node_modules/.bin/tsx scripts/split-funsize-groups.ts --apply    # write
 */
import { createClient } from "@sanity/client";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes("--apply");
const env: Record<string, string | undefined> = { ...process.env };
for (const f of [join(here, "../../web/.env"), join(here, "../.env.local")]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const client = createClient({
  projectId: (env.SANITY_PROJECT_ID ?? env.PUBLIC_SANITY_PROJECT_ID)!,
  dataset: env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  const [group, item] = await Promise.all([
    client.fetch(`*[_id=="courseGroup-hi3"][0]`),
    client.fetch(`*[_id=="contentItem-course-001"][0]`),
  ]);
  const heads: { label: string; topics: string[] }[] = [];
  for (const t of item.topics as string[]) {
    if (t.startsWith("# ")) heads.push({ label: t.slice(2), topics: [] });
    else heads.at(-1)!.topics.push(t);
  }
  const first = group.years[0];
  const years = heads.map((h, i) => ({
    _key: `group-${i + 1}`,
    _type: "courseYear",
    label: h.label,
    ...(i === 0 ? { description: first.description } : {}),
    topics: h.topics,
  }));
  const flat = (item.topics as string[]).filter((t) => !t.startsWith("# "));
  console.log(JSON.stringify({ years, flatCount: flat.length }, null, 1));
  if (!apply) return;
  writeFileSync(join(here, `../../audit-review/sanity-backup-funsize-${Date.now()}.json`), JSON.stringify([group, item], null, 2));
  await client.transaction().patch("courseGroup-hi3", (p) => p.set({ years })).patch("contentItem-course-001", (p) => p.set({ topics: flat })).commit();
  console.log("applied");
}
main().catch((e) => { console.error(e); process.exit(1); });
