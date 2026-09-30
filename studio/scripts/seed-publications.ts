/**
 * One-time seed: creates a `publication` document (with logo) for each outside
 * media outlet Aimee has appeared in or been covered by, and links any
 * contentItem whose free-text `venue` matches one of that outlet's known
 * aliases to the new publication via the `publication` reference field.
 *
 * Safe to re-run: publications are created with deterministic _ids via
 * createOrReplace, and a contentItem's `publication` field is only set if
 * it isn't already set to something else.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/seed-publications.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/seed-publications.ts
 *
 * Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN in the
 * environment (same variables and values the dashboard already uses).
 */
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const logoPath = (file: string) =>
  fileURLToPath(new URL(`../../prototypes/src/logos/${file}`, import.meta.url));

type PublicationSeed = {
  id: string;
  name: string;
  url: string;
  logo: string;
  /** venue strings on existing contentItem docs that should link here */
  aliases: string[];
};

const PUBLICATIONS: PublicationSeed[] = [
  {
    id: "publication-self",
    name: "SELF",
    url: "https://www.self.com",
    logo: logoPath("self.svg"),
    aliases: ["SELF"],
  },
  {
    id: "publication-huffpost",
    name: "HuffPost",
    url: "https://www.huffpost.com",
    logo: logoPath("huffpost.svg"),
    aliases: ["HuffPost"],
  },
  {
    id: "publication-medpagetoday",
    name: "MedPage Today",
    url: "https://www.medpagetoday.com",
    logo: logoPath("medpagetoday.svg"),
    aliases: ["MedPage Today"],
  },
  {
    id: "publication-the-conversation",
    name: "The Conversation",
    url: "https://theconversation.com",
    logo: logoPath("the-conversation.svg"),
    aliases: ["The Conversation", "The Conversation / Slate"],
  },
  {
    id: "publication-tedx",
    name: "TEDx",
    url: "https://www.ted.com/tedx",
    logo: logoPath("tedx.svg"),
    aliases: ["TEDxCU"],
  },
  {
    id: "publication-aai",
    name: "American Association of Immunologists (AAI)",
    url: "https://www.aai.org",
    logo: logoPath("aai.png"),
    aliases: [
      "American Association of Immunologists (AAI)",
      "American Association of Immunologists, poster and education breakout session",
      "American Association of Immunologists (AAI) webinar",
      "AAI Immunology Explained",
      "AAI Newsletter",
    ],
  },
  {
    id: "publication-cu-anschutz",
    name: "CU Anschutz",
    url: "https://www.cuanschutz.edu",
    logo: logoPath("cu-anschutz.png"),
    aliases: ["CU Anschutz", "CU Anschutz Today", "CU Anschutz Momentum", "CU Anschutz Monthly Friends Report"],
  },
  {
    id: "publication-cu-denver",
    name: "CU Denver",
    url: "https://www.ucdenver.edu",
    logo: logoPath("cu-denver.png"),
    aliases: ["CU Denver"],
  },
  {
    id: "publication-koa",
    name: "KOA Morning News",
    url: "https://www.850koa.com",
    logo: logoPath("koa.png"),
    aliases: ["KOA Morning News"],
  },
];

async function main() {
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("Missing SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in the environment.");
  }

  let itemsLinked = 0;
  let itemsSkipped = 0;

  for (const pub of PUBLICATIONS) {
    console.log(`\n${pub.name} (${pub.id})`);

    if (dryRun) {
      console.log(`  [dry run] would upload ${pub.logo} and createOrReplace ${pub.id}`);
    } else {
      const asset = await client.assets.upload("image", createReadStream(pub.logo), {
        filename: pub.logo.split("/").pop(),
      });
      await client.createOrReplace({
        _id: pub.id,
        _type: "publication",
        name: pub.name,
        url: pub.url,
        logo: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      });
      console.log(`  Uploaded logo and wrote ${pub.id}`);
    }

    const matches = await client.fetch<{ _id: string; publication?: { _ref: string }; title: string }[]>(
      `*[_type == "contentItem" && venue in $aliases]{_id, publication, title}`,
      { aliases: pub.aliases },
    );

    for (const item of matches) {
      if (item.publication && item.publication._ref !== pub.id) {
        console.log(`  Skipping "${item.title}" (${item._id}) — already linked to a different publication`);
        itemsSkipped++;
        continue;
      }
      console.log(`  ${dryRun ? "[dry run] would link" : "Linking"} "${item.title}" (${item._id})`);
      if (!dryRun) {
        await client
          .patch(item._id)
          .set({ publication: { _type: "reference", _ref: pub.id } })
          .commit();
      }
      itemsLinked++;
    }
  }

  console.log(`\n${dryRun ? "[dry run] would link" : "Linked"} ${itemsLinked} content items, ${itemsSkipped} skipped.`);
  if (dryRun) {
    console.log("Dry run — nothing was written. Re-run without --dry-run to commit.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
