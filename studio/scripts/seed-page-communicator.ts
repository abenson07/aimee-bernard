/**
 * One-time seed: creates the `pageCommunicator` singleton from the copy that
 * is currently hardcoded in web/src/pages/communicator.astro, so the page looks
 * identical the day it switches to reading from Sanity.
 *
 * Safe to re-run: uses createIfNotExists, so it never overwrites edits.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/seed-page-communicator.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/seed-page-communicator.ts
 *
 * Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN in the
 * environment (same values the dashboard uses).
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

const doc = {
  _id: "pageCommunicator",
  _type: "pageCommunicator",
  heroTitle: "Talking about science so people listen",
  heroBlurb: "Talks, keynotes, and workshops on making immunology clear, honest, and human.",
  stats: [
    { _key: "years", _type: "stat", value: "25+", label: "Years as an educator, scientist & communicator" },
    { _key: "courses", _type: "stat", value: "18", label: "Courses taught" },
    { _key: "talks", _type: "stat", value: "21+", label: "Talks given" },
  ],
  contributesHeading: "Aimee regularly contributes to...",
  contributesCards: [
    { _key: "unbiased", _type: "contributesCard", name: "Unbiased Science", role: "Immunology Expert" },
    { _key: "podcast", _type: "contributesCard", name: "The Immunology Podcast", role: "Guest Expert" },
    { _key: "conversation", _type: "contributesCard", name: "The Conversation", role: "Contributing Author" },
  ],
};

if (dryRun) {
  console.log(JSON.stringify(doc, null, 2));
} else {
  await client.createIfNotExists(doc);
  console.log("pageCommunicator ready.");
}
