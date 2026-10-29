import type { QueryParams } from "sanity";
import { sanityClient } from "sanity:client";

// Visual editing is a dev / preview-deployment mode. On the public site it is
// off: queries read published content and pages stay prerendered.
export const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

export async function loadQuery<T>({ query, params }: { query: string; params?: QueryParams }) {
  if (visualEditingEnabled && !token) {
    throw new Error("SANITY_API_READ_TOKEN is required when PUBLIC_SANITY_VISUAL_EDITING_ENABLED is true.");
  }
  const { result } = await sanityClient.fetch<T>(query, params ?? {}, {
    filterResponse: false,
    perspective: visualEditingEnabled ? "drafts" : "published",
    resultSourceMap: visualEditingEnabled ? "withKeyArraySelector" : false,
    stega: visualEditingEnabled,
    ...(visualEditingEnabled ? { token } : {}),
    useCdn: false,
  });
  return result as T;
}
