import { createClient } from "@sanity/client";

// Server-only client for the review overlay's comment API routes. Separate
// from `sanity:client` (used everywhere else for public reads) because this
// one carries a write token and must never reach the browser bundle.
export const sanityWriteClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: "2026-08-14",
  token: import.meta.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
