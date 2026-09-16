import "server-only";
import { createClient } from "@sanity/client";

const DEFAULT_API_VERSION = "2026-08-14";
const envApiVersion = process.env.SANITY_API_VERSION?.trim() ?? "";
const apiVersion =
  envApiVersion === "1" || /^\d{4}-\d{2}-\d{2}$/.test(envApiVersion)
    ? envApiVersion
    : DEFAULT_API_VERSION;

const config = {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion,
  useCdn: false,
};

/* Reads stay anonymous so a revoked write token cannot 401 the dashboard
   shell (Sanity: "Unauthorized - Session not found"). Mutations still use
   the Editor token. */
export const sanityReadClient = createClient({
  ...config,
  perspective: "published",
});

export const sanityClient = createClient({
  ...config,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
