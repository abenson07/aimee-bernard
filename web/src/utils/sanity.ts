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

const WORK_ITEMS_QUERY = defineQuery(`*[_type == "contentItem" && defined(kind)] | order(_createdAt asc){
  _id, title, kind, venue, date, url, "fileUrl": file.asset->url, "category": category->name
}`);

export type WorkItem = {
  _id: string;
  title: string | null;
  kind: string | null;
  venue: string | null;
  date: string | null;
  url: string | null;
  fileUrl: string | null;
  category: string | null;
};

/** Every content item with a kind, for the Work page's filter grid. */
export async function getWorkItems(): Promise<WorkItem[]> {
  return sanityClient.fetch(WORK_ITEMS_QUERY);
}
