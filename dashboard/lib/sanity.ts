import "server-only";
import { createClient } from "@sanity/client";

const DEFAULT_API_VERSION = "2026-08-14";
const envApiVersion = process.env.SANITY_API_VERSION?.trim() ?? "";
const apiVersion =
  envApiVersion === "1" || /^\d{4}-\d{2}-\d{2}$/.test(envApiVersion)
    ? envApiVersion
    : DEFAULT_API_VERSION;

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
