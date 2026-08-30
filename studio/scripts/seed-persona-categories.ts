/**
 * One-time seed: loads the AI-suggested persona categories (produced by a
 * manual classification pass against content-classification-guide.md,
 * data/persona-suggestions.json) into Sanity.
 *
 * Safe to re-run: it always refreshes the frozen categorySuggested* /
 * categoryRationale / categoryFlaggedForReview fields, but only pre-fills the
 * live category / categorySecondary fields for items nobody has reviewed yet
 * (categoryReviewedAt unset) — it never overwrites a human decision.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/seed-persona-categories.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/seed-persona-categories.ts
 *
 * Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN in the
 * environment (same variables and values the dashboard already uses).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const suggestionsPath = fileURLToPath(new URL("./data/persona-suggestions.json", import.meta.url));
const suggestions = JSON.parse(readFileSync(suggestionsPath, "utf8"));

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CANONICAL_NAME: Record<string, string> = {
  "science communicator": "Science Communicator",
  "community outreach": "Community Outreach",
};

type Suggestion = {
  title: string;
  primary: string;
  secondary: string | null;
  rationale: string;
  flagged: boolean;
};

async function main() {
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("Missing SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in the environment.");
  }

  // 1. category name -> _id, normalizing the two inconsistently-cased docs
  //    while we're already looking at them.
  const categoryDocs = await client.fetch<{ _id: string; name: string }[]>(
    `*[_type == "category"]{_id, name}`,
  );
  const categoryIdByName = new Map<string, string>();
  for (const doc of categoryDocs) {
    categoryIdByName.set(doc.name.toLowerCase(), doc._id);
    const canonical = CANONICAL_NAME[doc.name.toLowerCase()];
    if (canonical && canonical !== doc.name) {
      console.log(`${dryRun ? "[dry run] would rename" : "Renaming"} category "${doc.name}" -> "${canonical}"`);
      if (!dryRun) {
        await client.patch(doc._id).set({ name: canonical }).commit();
      }
    }
  }
  if (categoryDocs.length !== 4) {
    console.warn(`Expected 4 category docs, found ${categoryDocs.length}. Continuing anyway.`);
  }

  // 2. items already reviewed by a human — never touch their live category.
  const reviewed = await client.fetch<string[]>(
    `*[_type == "contentItem" && defined(categoryReviewedAt)]._id`,
  );
  const reviewedIds = new Set(reviewed);

  const entries = Object.entries(suggestions as Record<string, Suggestion>);
  let patched = 0;
  let livePrefilled = 0;
  let liveSkipped = 0;
  let missingCategory = 0;

  let tx = client.transaction();

  for (const [id, row] of entries) {
    const primaryId = categoryIdByName.get(row.primary.toLowerCase());
    const secondaryId = row.secondary ? categoryIdByName.get(row.secondary.toLowerCase()) : undefined;

    if (!primaryId) {
      console.warn(`Skipping ${id} ("${row.title}") — no category doc named "${row.primary}"`);
      missingCategory++;
      continue;
    }

    const set: Record<string, unknown> = {
      categorySuggested: { _type: "reference", _ref: primaryId },
      categoryRationale: row.rationale,
      categoryFlaggedForReview: row.flagged,
    };
    const unset: string[] = [];

    if (secondaryId) {
      set.categorySuggestedSecondary = { _type: "reference", _ref: secondaryId };
    } else {
      unset.push("categorySuggestedSecondary");
    }

    if (reviewedIds.has(id)) {
      liveSkipped++;
    } else {
      set.category = { _type: "reference", _ref: primaryId };
      if (secondaryId) {
        set.categorySecondary = { _type: "reference", _ref: secondaryId };
      } else {
        unset.push("categorySecondary");
      }
      livePrefilled++;
    }

    tx = tx.patch(id, { set, unset });
    patched++;
  }

  console.log(
    `\n${dryRun ? "[dry run] would patch" : "Patching"} ${patched} items ` +
      `(${livePrefilled} pre-filled live category, ${liveSkipped} already reviewed and left alone), ` +
      `${missingCategory} skipped for an unresolved category name.`,
  );

  if (!dryRun) {
    await tx.commit();
    console.log("Done.");
  } else {
    console.log("Dry run — nothing was written. Re-run without --dry-run to commit.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
