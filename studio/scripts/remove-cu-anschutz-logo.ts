/**
 * Removes the CU Anschutz logo from the "CU Anschutz" publication document (Aimee's audit:
 * "they are very protective of it"). Clears its logo image and its logo-strip position, so it
 * disappears from the Home and Communicator logo strips and from any card that borrows the logo.
 * The document itself stays. Dry run by default; add --apply to write (saves a backup first).
 *
 *   ../node_modules/.bin/tsx scripts/remove-cu-anschutz-logo.ts [--apply]
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

async function main() {
  const docs: any[] = await client.fetch(`*[_type == "publication" && name == "CU Anschutz"]`);
  if (docs.length !== 1) throw new Error(`Expected one "CU Anschutz" publication, found ${docs.length}`);
  const d = docs[0];
  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${d._id} "${d.name}": clear logo (${d.logo ? "has one" : "none"}) and stripOrder (${d.stripOrder ?? "none"})`);
  if (!apply) return;
  const dir = join(here, "../../audit-review");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `sanity-backup-cu-logo-${Date.now()}.json`), JSON.stringify(d, null, 2));
  await client.patch(d._id).unset(["logo", "stripOrder"]).commit();
  console.log("Done. Backup saved in audit-review/.");
}
main().catch((e) => { console.error(String(e?.message ?? e)); process.exit(1); });
