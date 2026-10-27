/**
 * Uploads image files from ../images/ to Sanity as image assets (the photo library).
 * Usage (from studio/): ../node_modules/.bin/tsx scripts/upload-images.ts "file one.png" "file two.png"
 * Reads SANITY_API_WRITE_TOKEN from studio/.env.local (never printed) and the project id from ../web/.env.
 */
import { createClient } from "@sanity/client";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
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
if (!projectId) throw new Error("No Sanity project id found (web/.env).");
if (!env.SANITY_API_WRITE_TOKEN) throw new Error("Needs SANITY_API_WRITE_TOKEN in studio/.env.local.");
const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token: env.SANITY_API_WRITE_TOKEN, useCdn: false });

async function main() {
  for (const name of process.argv.slice(2)) {
    const asset = await client.assets.upload("image", createReadStream(join(here, "../../images", name)), { filename: name });
    console.log(`${name} -> ${asset._id}`);
  }
}
main();
