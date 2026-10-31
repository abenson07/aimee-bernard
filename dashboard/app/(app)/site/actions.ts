"use server";

import { verifySession } from "@/lib/dal";
import { CONTENT_ITEM_FIELDS } from "@/lib/queries";
import { sanityClient } from "@/lib/sanity";
import type { ContentItem } from "@/lib/types";
import { isSitePageId, isSlotKey, sitePageTitle } from "@/lib/site";

export type SlotValue = {
  _key: string;
  label: string;
  kind: "text" | "longtext" | "image";
  text?: string;
  alt?: string;
  image?: { url: string; hotspot?: { x: number; y: number } | null } | null;
};
export type PageState = {
  id: string;
  title: string;
  hasDraft: boolean;
  slots: SlotValue[];
};
export type Result = { ok: true } | { ok: false; error: string };
export type Photo = {
  id: string;
  url: string;
  width: number;
  height: number;
  name: string;
};
export type CourseGroupFields = {
  name: string;
  tileMeta: string[];
  pill: string;
  dates: string;
  intro: string;
  body: string;
  tags: string[];
};
export type PublicationFields = {
  name: string;
  url: string;
  stripOrder: number | null;
};
/** A Sanity item clicked on the page (award, press card, course tile, logo). */
export type SiteDoc =
  | { type: "contentItem"; item: ContentItem }
  | { type: "courseGroup"; id: string; fields: CourseGroupFields }
  | {
      type: "publication";
      id: string;
      logo: string | null;
      fields: PublicationFields;
    };

const draftId = (id: string) => `drafts.${id}`;

const SLOTS = `slots[]{ _key, label, kind, text, alt, "image": image{ "url": asset->url, hotspot } }`;

/** The page as the editor sees it: the draft if there is one, otherwise what is published. */
export async function loadPage(id: string): Promise<PageState | null> {
  await verifySession();
  if (!isSitePageId(id)) return null;
  const [draft, published] = await Promise.all([
    sanityClient.fetch(
      `*[_id == $id][0]{ title, ${SLOTS} }`,
      { id: draftId(id) },
      { perspective: "raw" },
    ),
    sanityClient.fetch(
      `*[_id == $id][0]{ title, ${SLOTS} }`,
      { id },
      { perspective: "raw" },
    ),
  ]);
  const doc = draft ?? published;
  // A page nobody has edited yet has no document; it starts empty (the page's code holds everything).
  if (!doc) return { id, title: sitePageTitle(id), hasDraft: false, slots: [] };
  return {
    id,
    title: doc.title ?? id,
    hasDraft: !!draft,
    slots: doc.slots ?? [],
  };
}

/** Makes sure a private draft copy exists, so edits never touch the live page until Publish. */
async function ensureDraft(id: string) {
  const published = await sanityClient.getDocument(id);
  if (published) {
    await sanityClient.createIfNotExists({ ...published, _id: draftId(id) });
  } else {
    await sanityClient.createIfNotExists({ _id: draftId(id), _type: "sitePage", title: sitePageTitle(id), slots: [] });
  }
}

/** Saves text to the draft. Text the page has never had edited before gets its slot added here
 *  (the page code holds the original wording as the fallback), so every heading can be edited
 *  without listing it in the seed catalog first. */
/** Adds the slot to the draft if the page has never had it edited (the page's code holds the original). */
async function ensureSlot(
  id: string,
  key: string,
  label: string,
  kind: "text" | "longtext" | "image",
) {
  const exists = await sanityClient.fetch(
    `defined(*[_id == $id][0].slots[_key == $key][0])`,
    { id: draftId(id), key },
    { perspective: "raw" },
  );
  if (exists) return;
  await sanityClient
    .patch(draftId(id))
    .setIfMissing({ slots: [] })
    .append("slots", [
      { _key: key, _type: "siteSlot", label: label.slice(0, 120) || key, kind },
    ])
    .commit();
}

export async function saveText(
  id: string,
  key: string,
  text: string,
  label = "",
): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id) || !isSlotKey(key))
    return { ok: false, error: "Unknown page or field." };
  const value = text.replace(/\r\n/g, "\n").trim();
  if (!value)
    return { ok: false, error: "Text can’t be empty. Use Discard to go back." };
  if (value.length > 1000) return { ok: false, error: "That’s too long." };
  try {
    await ensureDraft(id);
    const exists = await sanityClient.fetch(
      `defined(*[_id == $id][0].slots[_key == $key][0])`,
      { id: draftId(id), key },
      { perspective: "raw" },
    );
    const patch = sanityClient.patch(draftId(id));
    if (exists) patch.set({ [`slots[_key=="${key}"].text`]: value });
    else
      patch.setIfMissing({ slots: [] }).append("slots", [
        {
          _key: key,
          _type: "siteSlot",
          label: label.slice(0, 120) || key,
          kind:
            value.includes("\n") || value.length > 140 ? "longtext" : "text",
          text: value,
        },
      ]);
    await patch.commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

export async function savePhoto(
  id: string,
  key: string,
  assetId: string,
  focus: { x: number; y: number },
  alt: string,
  label = "",
): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id) || !isSlotKey(key))
    return { ok: false, error: "Unknown page or field." };
  if (!/^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/.test(assetId))
    return { ok: false, error: "That isn’t a photo." };
  const x = Math.min(1, Math.max(0, Number(focus.x)));
  const y = Math.min(1, Math.max(0, Number(focus.y)));
  try {
    await ensureDraft(id);
    await ensureSlot(id, key, label, "image");
    await sanityClient
      .patch(draftId(id))
      .set({
        [`slots[_key=="${key}"].image`]: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
          hotspot: {
            _type: "sanity.imageHotspot",
            x,
            y,
            width: 0.2,
            height: 0.2,
          },
        },
        [`slots[_key=="${key}"].alt`]: alt.slice(0, 200),
      })
      .commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

/** Just the description of a photo, read aloud to people who can't see it. */
export async function saveAlt(
  id: string,
  key: string,
  alt: string,
  label = "",
): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id) || !isSlotKey(key))
    return { ok: false, error: "Unknown page or field." };
  try {
    await ensureDraft(id);
    await ensureSlot(id, key, label, "image");
    await sanityClient
      .patch(draftId(id))
      .set({ [`slots[_key=="${key}"].alt`]: alt.trim().slice(0, 200) })
      .commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

/** Upload a new photo into the shared library. */
export async function uploadPhoto(
  formData: FormData,
): Promise<{ ok: true; photo: Photo } | { ok: false; error: string }> {
  await verifySession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Choose a photo to upload." };
  if (!file.type.startsWith("image/"))
    return {
      ok: false,
      error: "That file isn’t a photo (use JPG, PNG or WebP).",
    };
  if (file.size > 20 * 1024 * 1024)
    return {
      ok: false,
      error: "That photo is over 20 MB. Please make it smaller.",
    };
  try {
    const asset = await sanityClient.assets.upload(
      "image",
      Buffer.from(await file.arrayBuffer()),
      { filename: file.name, contentType: file.type },
    );
    const d = asset.metadata?.dimensions;
    return {
      ok: true,
      photo: {
        id: asset._id,
        url: asset.url,
        width: d?.width ?? 0,
        height: d?.height ?? 0,
        name: asset.originalFilename ?? file.name,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Upload failed.",
    };
  }
}

/** Every photo already uploaded (newest first), so she can reuse one without uploading it again. */
export async function listPhotos(): Promise<Photo[]> {
  await verifySession();
  const rows: {
    _id: string;
    url: string;
    w: number;
    h: number;
    name?: string;
  }[] = await sanityClient.fetch(
    `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...150]{ _id, url, "w": metadata.dimensions.width, "h": metadata.dimensions.height, "name": originalFilename }`,
  );
  return rows.map((r) => ({
    id: r._id,
    url: r.url,
    width: r.w ?? 0,
    height: r.h ?? 0,
    name: r.name ?? "",
  }));
}

export async function publishPage(id: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id)) return { ok: false, error: "Unknown page." };
  try {
    const draft = await sanityClient.getDocument(draftId(id));
    if (!draft) return { ok: true }; // nothing to publish
    await sanityClient
      .transaction()
      .createOrReplace({ ...draft, _id: id })
      .delete(draftId(id))
      .commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not publish.",
    };
  }
}

export async function discardDraft(id: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id)) return { ok: false, error: "Unknown page." };
  try {
    await sanityClient.delete(draftId(id));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not discard.",
    };
  }
}

const isDocId = (id: unknown): id is string =>
  typeof id === "string" &&
  /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$/.test(id) &&
  !id.startsWith("drafts.");

/** Loads a Sanity item clicked on the page, for its edit window. */
export async function loadDoc(
  id: string,
  type: string,
): Promise<SiteDoc | null> {
  await verifySession();
  if (!isDocId(id)) return null;
  if (type === "contentItem") {
    const item = await sanityClient.fetch<ContentItem | null>(
      `*[_type == "contentItem" && _id == $id][0]{ ${CONTENT_ITEM_FIELDS} }`,
      { id },
    );
    return item ? { type, item } : null;
  }
  if (type === "courseGroup") {
    const g = await sanityClient.fetch(
      `*[_type == "courseGroup" && _id == $id][0]{ name, tileMeta, pill, dates, intro, body, tags }`,
      { id },
    );
    if (!g) return null;
    return {
      type,
      id,
      fields: {
        name: g.name ?? "",
        tileMeta: g.tileMeta ?? [],
        pill: g.pill ?? "",
        dates: g.dates ?? "",
        intro: g.intro ?? "",
        body: g.body ?? "",
        tags: g.tags ?? [],
      },
    };
  }
  if (type === "publication") {
    const p = await sanityClient.fetch(
      `*[_type == "publication" && _id == $id][0]{ name, url, stripOrder, "logo": logo.asset->url }`,
      { id },
    );
    if (!p) return null;
    return {
      type,
      id,
      logo: p.logo ?? null,
      fields: {
        name: p.name ?? "",
        url: p.url ?? "",
        stripOrder: typeof p.stripOrder === "number" ? p.stripOrder : null,
      },
    };
  }
  return null;
}

const clean = (s: unknown, max = 2000) =>
  String(s ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
const cleanList = (list: unknown) =>
  Array.isArray(list)
    ? list
        .map((x) => clean(x, 300))
        .filter(Boolean)
        .slice(0, 30)
    : [];

/** Course tiles go live straight away, like every item in the content log. */
export async function saveCourseGroup(
  id: string,
  f: CourseGroupFields,
): Promise<Result> {
  await verifySession();
  if (!isDocId(id)) return { ok: false, error: "Unknown course tile." };
  const name = clean(f.name, 200);
  if (!name) return { ok: false, error: "The tile needs a name." };
  try {
    await sanityClient
      .patch(id)
      .set({
        name,
        tileMeta: cleanList(f.tileMeta),
        pill: clean(f.pill, 200),
        dates: clean(f.dates, 200),
        intro: clean(f.intro),
        body: clean(f.body),
        tags: cleanList(f.tags),
      })
      .commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

export async function savePublication(
  id: string,
  f: PublicationFields,
): Promise<Result> {
  await verifySession();
  if (!isDocId(id)) return { ok: false, error: "Unknown logo." };
  const name = clean(f.name, 200);
  if (!name) return { ok: false, error: "The outlet needs a name." };
  const url = clean(f.url, 500);
  if (url && !/^https?:\/\//.test(url))
    return { ok: false, error: "The website should start with https://" };
  try {
    const patch = sanityClient.patch(id).set({ name });
    if (url) patch.set({ url });
    else patch.unset(["url"]);
    if (f.stripOrder === null || !Number.isFinite(f.stripOrder))
      patch.unset(["stripOrder"]);
    else patch.set({ stripOrder: f.stripOrder });
    await patch.commit();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}
