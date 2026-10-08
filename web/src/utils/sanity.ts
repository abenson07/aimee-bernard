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
  _id, title, kind, venue, date, url, "fileUrl": file.asset->url, "image": image.asset->url, "category": category->name
}`);

export type WorkItem = {
  _id: string;
  title: string | null;
  kind: string | null;
  venue: string | null;
  date: string | null;
  url: string | null;
  fileUrl: string | null;
  /** Optional hover image from the dashboard. */
  image?: string | null;
  category: string | null;
};

/** Every content item with a kind, for the Work page's filter grid. */
export async function getWorkItems(): Promise<WorkItem[]> {
  return sanityClient.fetch(WORK_ITEMS_QUERY);
}

/* ---------------------------------------------------------------------------
   Queries for the designed pages. Every one is read inside a server island
   (see components/site/), so a slow or failed read never blocks the page.
   When a read fails, the item lists fall back to the saved work snapshot.
   --------------------------------------------------------------------------- */

export type CardItem = {
  _id: string;
  title: string | null;
  kind: string | null;
  venue: string | null;
  date: string | null;
  /** The link to follow, or null when the item has no link or file. */
  href: string | null;
  /** Optional photo, revealed on hover. */
  image: string | null;
  /** Logo from the item's linked publication. */
  logo: string | null;
  logoName: string | null;
};

const CARD_FIELDS = `_id, title, kind, venue, date,
  "href": coalesce(url, file.asset->url),
  "image": image.asset->url,
  "logo": publication->logo.asset->url,
  "logoName": publication->name`;

type SnapshotRow = { _id: string; title: string | null; kind: string | null; venue: string | null; date: string | null; url: string | null; fileUrl: string | null; category: string | null };

async function snapshotRows(): Promise<SnapshotRow[]> {
  return (await import("@/data/work-snapshot.json")).default as SnapshotRow[];
}

function fromSnapshot(row: SnapshotRow): CardItem {
  return { _id: row._id, title: row.title, kind: row.kind, venue: row.venue, date: row.date, href: row.url ?? row.fileUrl, image: null, logo: null, logoName: null };
}

async function withSnapshot(read: () => Promise<CardItem[]>, pick: (rows: SnapshotRow[]) => SnapshotRow[]): Promise<CardItem[]> {
  try {
    const items = await read();
    if (items.length) return items;
  } catch (err) {
    console.warn("Sanity read failed, using the saved snapshot.", err);
  }
  return pick(await snapshotRows()).map(fromSnapshot);
}

/** Press items, most recently updated first. */
export function getPressItems(limit: number): Promise<CardItem[]> {
  return withSnapshot(
    () => sanityClient.fetch(`*[_type == "contentItem" && kind == "press-mentions"] | order(_updatedAt desc)[0...$limit]{ ${CARD_FIELDS} }`, { limit }),
    (rows) => rows.filter((r) => r.kind === "press-mentions").slice(0, limit),
  );
}

export const SCI_COMM_KINDS = ["talk", "podcast", "press-mentions", "article"];

/** Items filed under Science Communicator, most recently updated first. */
export function getSciCommItems(limit: number): Promise<CardItem[]> {
  return withSnapshot(
    () =>
      sanityClient.fetch(
        `*[_type == "contentItem" && category->name == "Science Communicator" && kind in $kinds] | order(_updatedAt desc)[0...$limit]{ ${CARD_FIELDS} }`,
        { limit, kinds: SCI_COMM_KINDS },
      ),
    (rows) => rows.filter((r) => r.category === "Science Communicator" && SCI_COMM_KINDS.includes(r.kind ?? "")).slice(0, limit),
  );
}

/** The item switched on as "Feature on Communicator page" (most recently updated wins). */
export async function getFeaturedCommunicatorItem(): Promise<CardItem | null> {
  try {
    return await sanityClient.fetch(`*[_type == "contentItem" && featuredOnCommunicator == true] | order(_updatedAt desc)[0]{ ${CARD_FIELDS} }`);
  } catch (err) {
    console.warn("Sanity read failed for the featured item.", err);
    return null;
  }
}

/** The year at the start of a free-text date like "April 2026" or "2020-current". */
export function yearOf(date: string | null | undefined): number {
  const m = date?.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : 0;
}

/** Awards, newest year first. */
export function getAwards(): Promise<CardItem[]> {
  return withSnapshot(
    async () => {
      const items: CardItem[] = await sanityClient.fetch(`*[_type == "contentItem" && kind == "award"]{ ${CARD_FIELDS} }`);
      return items.sort((a, b) => yearOf(b.date) - yearOf(a.date));
    },
    (rows) => rows.filter((r) => r.kind === "award").sort((a, b) => yearOf(b.date) - yearOf(a.date)),
  );
}

/** Research papers, newest first, one entry per title. */
export function getPapers(): Promise<CardItem[]> {
  const dedupe = (items: CardItem[]) => {
    const seen = new Map<string, CardItem>();
    for (const item of items) {
      const key = (item.title ?? "").trim().toLowerCase();
      const prev = seen.get(key);
      const score = (i: CardItem) => [i.href, i.venue, i.date].filter(Boolean).length;
      if (!prev || score(item) > score(prev)) seen.set(key, item);
    }
    return [...seen.values()];
  };
  return withSnapshot(
    async () => dedupe(await sanityClient.fetch(`*[_type == "contentItem" && kind == "research-publication" && defined(title)]{ ${CARD_FIELDS} }`)),
    (rows) => rows.filter((r) => r.kind === "research-publication" && r.title),
  );
}

export type StripLogo = { name: string; logo: string; url: string | null };

/** Logos for the scrolling strips, in the order set on each publication. */
export async function getStripLogos(): Promise<StripLogo[]> {
  try {
    const rows: { name: string; logo: string | null; url: string | null }[] = await sanityClient.fetch(
      `*[_type == "publication" && defined(stripOrder) && defined(logo)] | order(stripOrder asc){ name, "logo": logo.asset->url, url }`,
    );
    return rows.filter((r): r is StripLogo => !!r.logo);
  } catch (err) {
    console.warn("Sanity read failed for the logo strip.", err);
    return [];
  }
}

export type CourseYear = {
  label: string | null;
  description: string | null;
  linkUrl: string | null;
  courses: { _id: string; title: string | null; topics: string[] | null }[];
};

export type CourseGroup = {
  _id: string;
  name: string | null;
  icon: string | null;
  tileMeta: string[] | null;
  pill: string | null;
  dates: string | null;
  intro: string | null;
  body: string | null;
  tags: string[] | null;
  image: string | null;
  years: CourseYear[] | null;
};

/** The tiles on the Educator page, with their panels. */
export async function getCourseGroups(): Promise<CourseGroup[]> {
  try {
    return await sanityClient.fetch(`*[_type == "courseGroup"] | order(order asc){
      _id, name, icon, tileMeta, pill, dates, intro, body, tags,
      "image": image.asset->url,
      "years": years[]{ label, description, linkUrl, "courses": courses[]->{ _id, title, topics } }
    }`);
  } catch (err) {
    console.warn("Sanity read failed for the course groups.", err);
    return [];
  }
}
