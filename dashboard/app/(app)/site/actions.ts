"use server";

import { verifySession } from "@/lib/dal";
import { sanityClient } from "@/lib/sanity";
import { isSitePageId, isSlotKey } from "@/lib/site";

export type SlotValue = {
  _key: string;
  label: string;
  kind: "text" | "longtext" | "image";
  text?: string;
  alt?: string;
  image?: { url: string; hotspot?: { x: number; y: number } | null } | null;
};
export type PageState = { id: string; title: string; hasDraft: boolean; slots: SlotValue[] };
export type Result = { ok: true } | { ok: false; error: string };
export type Photo = { id: string; url: string; width: number; height: number; name: string };

const draftId = (id: string) => `drafts.${id}`;

const SLOTS = `slots[]{ _key, label, kind, text, alt, "image": image{ "url": asset->url, hotspot } }`;

/** The page as the editor sees it: the draft if there is one, otherwise what is published. */
export async function loadPage(id: string): Promise<PageState | null> {
  await verifySession();
  if (!isSitePageId(id)) return null;
  const [draft, published] = await Promise.all([
    sanityClient.fetch(`*[_id == $id][0]{ title, ${SLOTS} }`, { id: draftId(id) }, { perspective: "raw" }),
    sanityClient.fetch(`*[_id == $id][0]{ title, ${SLOTS} }`, { id }, { perspective: "raw" }),
  ]);
  const doc = draft ?? published;
  if (!doc) return null;
  return { id, title: doc.title ?? id, hasDraft: !!draft, slots: doc.slots ?? [] };
}

/** Makes sure a private draft copy exists, so edits never touch the live page until Publish. */
async function ensureDraft(id: string) {
  const published = await sanityClient.getDocument(id);
  if (!published) throw new Error("That page is not set up yet.");
  await sanityClient.createIfNotExists({ ...published, _id: draftId(id) });
}

export async function saveText(id: string, key: string, text: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id) || !isSlotKey(key)) return { ok: false, error: "Unknown page or field." };
  const value = text.replace(/\r\n/g, "\n").trim();
  if (!value) return { ok: false, error: "A heading or paragraph can’t be empty. Use Discard to go back." };
  if (value.length > 1000) return { ok: false, error: "That’s too long." };
  try {
    await ensureDraft(id);
    await sanityClient.patch(draftId(id)).set({ [`slots[_key=="${key}"].text`]: value }).commit();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}

export async function savePhoto(id: string, key: string, assetId: string, focus: { x: number; y: number }, alt: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id) || !isSlotKey(key)) return { ok: false, error: "Unknown page or field." };
  if (!/^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/.test(assetId)) return { ok: false, error: "That isn’t a photo." };
  const x = Math.min(1, Math.max(0, Number(focus.x)));
  const y = Math.min(1, Math.max(0, Number(focus.y)));
  try {
    await ensureDraft(id);
    await sanityClient
      .patch(draftId(id))
      .set({
        [`slots[_key=="${key}"].image`]: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
          hotspot: { _type: "sanity.imageHotspot", x, y, width: 0.2, height: 0.2 },
        },
        [`slots[_key=="${key}"].alt`]: alt.slice(0, 200),
      })
      .commit();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}

/** Upload a new photo into the shared library. */
export async function uploadPhoto(formData: FormData): Promise<{ ok: true; photo: Photo } | { ok: false; error: string }> {
  await verifySession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "That file isn’t a photo (use JPG, PNG or WebP)." };
  if (file.size > 20 * 1024 * 1024) return { ok: false, error: "That photo is over 20 MB. Please make it smaller." };
  try {
    const asset = await sanityClient.assets.upload("image", Buffer.from(await file.arrayBuffer()), { filename: file.name, contentType: file.type });
    const d = asset.metadata?.dimensions;
    return { ok: true, photo: { id: asset._id, url: asset.url, width: d?.width ?? 0, height: d?.height ?? 0, name: asset.originalFilename ?? file.name } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." };
  }
}

/** Every photo already uploaded (newest first), so she can reuse one without uploading it again. */
export async function listPhotos(): Promise<Photo[]> {
  await verifySession();
  const rows: { _id: string; url: string; w: number; h: number; name?: string }[] = await sanityClient.fetch(
    `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...150]{ _id, url, "w": metadata.dimensions.width, "h": metadata.dimensions.height, "name": originalFilename }`,
  );
  return rows.map((r) => ({ id: r._id, url: r.url, width: r.w ?? 0, height: r.h ?? 0, name: r.name ?? "" }));
}

export async function publishPage(id: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id)) return { ok: false, error: "Unknown page." };
  try {
    const draft = await sanityClient.getDocument(draftId(id));
    if (!draft) return { ok: true }; // nothing to publish
    await sanityClient.transaction().createOrReplace({ ...draft, _id: id }).delete(draftId(id)).commit();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not publish." };
  }
}

export async function discardDraft(id: string): Promise<Result> {
  await verifySession();
  if (!isSitePageId(id)) return { ok: false, error: "Unknown page." };
  try {
    await sanityClient.delete(draftId(id));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not discard." };
  }
}
