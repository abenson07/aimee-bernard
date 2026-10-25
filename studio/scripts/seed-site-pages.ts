/**
 * Creates (or updates) the Site page documents from site-pages-catalog.ts, uploading today's photos,
 * so the Site editor has something to edit and the live pages look exactly as they do now.
 *
 * Safe to re-run: a slot that already has text or a photo in Sanity is left alone. Add --force to
 * overwrite everything from the catalog. Dry run by default; add --apply to write.
 *
 *   ../node_modules/.bin/tsx scripts/seed-site-pages.ts            # dry run
 *   ../node_modules/.bin/tsx scripts/seed-site-pages.ts --apply
 *
 * Reads SANITY_API_WRITE_TOKEN from studio/.env.local (never printed).
 */
import { createClient } from "@sanity/client";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, type Slot } from "./site-pages-catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");

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
const photos = join(here, "../../web/public/site/photos");
const uploaded = new Map<string, string>(); // file name -> asset id (upload each file once)

async function assetFor(file: string): Promise<string> {
  const known = uploaded.get(file);
  if (known) return known;
  if (!apply) return `(would upload ${file})`;
  const asset = await client.assets.upload("image", createReadStream(join(photos, file)), { filename: file });
  uploaded.set(file, asset._id);
  return asset._id;
}

async function main() {
  console.log(apply ? "APPLY mode.\n" : "DRY RUN (nothing is written).\n");
  const backups: unknown[] = [];
  for (const page of PAGES) {
    const existing: any = await client.fetch(`*[_id == $id][0]`, { id: page.id });
    if (existing) backups.push(existing);
    const have = new Map<string, any>((existing?.slots ?? []).map((s: any) => [s._key, s]));
    const slots: any[] = [];
    let added = 0, kept = 0;
    for (const slot of page.slots) {
      const cur = have.get(slot.key);
      const filled = cur && (cur.kind === "image" ? !!cur.image : !!cur.text);
      if (filled && !force) { slots.push(cur); kept++; continue; }
      slots.push(await build(slot, cur));
      added++;
    }
    // Keep any slots she (or a later version) added that are not in the catalog.
    for (const [k, s] of have) if (!page.slots.some((x) => x.key === k)) slots.push(s);
    console.log(`${page.id} "${page.title}": ${slots.length} slots (${added} written, ${kept} already filled)${existing ? "" : " [new document]"}`);
    for (const slot of page.slots) console.log(`   - ${slot.kind.padEnd(8)} ${slot.key}${slot.kind === "image" ? "  <- " + slot.file : ""}`);
    if (apply) await client.createOrReplace({ _id: page.id, _type: "sitePage", title: page.title, slots });
  }
  if (!apply) return console.log("\nDry run complete. Re-run with --apply to write.");
  if (backups.length) {
    const dir = join(here, "../../audit-review");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `sanity-backup-site-pages-${Date.now()}.json`), JSON.stringify(backups, null, 2));
  }
  console.log("\nDone.");
}

async function build(slot: Slot, cur: any) {
  const base = { _key: slot.key, _type: "siteSlot", label: slot.label, kind: slot.kind };
  if (slot.kind !== "image") return { ...base, text: slot.text };
  const [x, y] = slot.pos;
  return {
    ...base,
    alt: slot.alt,
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: await assetFor(slot.file) },
      hotspot: { _type: "sanity.imageHotspot", x: x / 100, y: y / 100, width: 0.2, height: 0.2 },
    },
  };
}

main().catch((e) => {
  console.error(String(e?.message ?? e));
  process.exit(1);
});
