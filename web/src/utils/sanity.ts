import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

const DOCUMENTS_QUERY = defineQuery(
  `*[] | order(_updatedAt desc)[0...10]{ _id, _type, _updatedAt }`,
);

export async function getRecentDocuments() {
  return sanityClient.fetch(DOCUMENTS_QUERY);
}
