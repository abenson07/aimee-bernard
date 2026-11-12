"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { findDuplicateTitles } from "@/lib/duplicates";
import { findBrokenLinks, type BrokenLink } from "@/lib/link-check";
import { categorizationEnabled } from "@/lib/flags";
import { sanityClient } from "@/lib/sanity";
import { SESSION_COOKIE } from "@/lib/session";
import { normalizeTitle } from "@/lib/titles";
import { KIND_OPTIONS, type DuplicateMatch } from "@/lib/types";
import { withHttps } from "@/lib/url";

export type FormState =
  | { error?: string; ok?: boolean; key?: string; duplicates?: DuplicateMatch[] }
  | undefined;

type PortableTextBlock = {
  _type: string;
  _key?: string;
  children?: { _type?: string; _key?: string; text?: string; marks?: string[] }[];
  [key: string]: unknown;
};

/** The editor posts Portable Text as JSON. Parse defensively — this arrives as
 *  a form field, so it is untrusted regardless of what the UI sends. */
function parsePortableText(input: string): PortableTextBlock[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const blocks = parsed.filter(
    (block): block is PortableTextBlock =>
      typeof block === "object" && block !== null && typeof (block as PortableTextBlock)._type === "string",
  );
  if (blocks.length !== parsed.length) return null;

  const hasText = blocks.some((block) =>
    (block.children ?? []).some((child) => child.text?.trim()),
  );
  if (!hasText) return null;

  /* The editor already keys everything, but a missing _key breaks Sanity's
     array handling, so backfill rather than trust. */
  return blocks.map((block) => ({
    ...block,
    _key: block._key ?? randomUUID(),
    children: block.children?.map((child) => ({ ...child, _key: child._key ?? randomUUID() })),
  }));
}

/** The links editor posts its rows as JSON. Parse defensively — this arrives
 *  as a form field, so it is untrusted regardless of what the UI sends. */
function parseLinks(input: string): { _key: string; _type: "link"; label?: string; url: string }[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;

  return parsed
    .filter((row): row is { _key?: unknown; label?: unknown; url?: unknown } =>
      typeof row === "object" && row !== null,
    )
    .map((row) => ({
      _key: typeof row._key === "string" && row._key ? row._key : randomUUID(),
      _type: "link" as const,
      url: withHttps(typeof row.url === "string" ? row.url.trim() : ""),
      ...(typeof row.label === "string" && row.label.trim()
        ? { label: row.label.trim() }
        : {}),
    }))
    .filter((row) => row.url);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function createContentItem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();

  const title = formData.get("title");
  const url = formData.get("url");
  const file = formData.get("file");
  const body = formData.get("body");
  const categoryId = formData.get("category");
  const description = formData.get("description");
  const kind = formData.get("kind");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Give this a title." };
  }
  /* Without a kind the item is saved but never shows in any list (the log
     filters by kind, and so does the website), which looks like the upload
     silently failed. */
  if (typeof kind !== "string" || !KIND_OPTIONS.some((option) => option.value === kind)) {
    return { error: "Pick what kind of content this is." };
  }
  if (categorizationEnabled && (typeof categoryId !== "string" || !categoryId)) {
    return { error: "Pick a category." };
  }

  const hasFile = file instanceof File && file.size > 0;
  const hasUrl = typeof url === "string" && url.trim().length > 0;
  const blocks = typeof body === "string" && body.trim() ? parsePortableText(body) : null;

  const sourceCount = [hasFile, hasUrl, Boolean(blocks)].filter(Boolean).length;
  if (sourceCount === 0) {
    return { error: "Add a file, a link, or some content." };
  }
  if (sourceCount > 1) {
    return { error: "Add just one source: a file, a link, or content." };
  }

  /* Warn before saving a second copy of something already here. The form
     sends confirmDuplicate once she has seen the warning and chosen to go on. */
  if (formData.get("confirmDuplicate") !== "1") {
    try {
      const duplicates = await findDuplicateTitles(title);
      if (duplicates.length > 0) return { duplicates };
    } catch {
      /* If the check itself fails, don't block her from saving. */
    }
  }

  const doc: { _type: string } & Record<string, unknown> = {
    _type: "contentItem",
    title: title.trim(),
    kind,
  };

  if (categorizationEnabled && typeof categoryId === "string" && categoryId) {
    doc.category = { _type: "reference", _ref: categoryId };
  }

  if (typeof description === "string" && description.trim()) {
    doc.description = description.trim();
  }

  try {
    if (hasFile && file instanceof File) {
      const asset = await sanityClient.assets.upload("file", file, { filename: file.name });
      doc.file = { _type: "file", asset: { _type: "reference", _ref: asset._id } };
    } else if (hasUrl && typeof url === "string") {
      doc.url = withHttps(url);
    } else if (blocks) {
      doc.body = blocks;
    }

    await sanityClient.create(doc);
  } catch (error) {
    console.error("createContentItem failed:", error);
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/site");
  return { ok: true };
}

export async function answerQuestion(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();
  if (!categorizationEnabled) return { error: "Not available yet." };

  const categoryId = formData.get("categoryId");
  const key = formData.get("key");
  const answer = formData.get("answer");

  if (typeof categoryId !== "string" || !categoryId) return { error: "Something went wrong." };
  if (typeof key !== "string" || !key) return { error: "Something went wrong." };
  if (typeof answer !== "string" || !answer.trim()) {
    return { error: "Add an answer first." };
  }

  try {
    await sanityClient
      .patch(categoryId)
      .set({
        [`refinementQA[_key=="${key}"].answer`]: answer.trim(),
        [`refinementQA[_key=="${key}"].answeredAt`]: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error("answerQuestion failed:", error);
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/site");
  return { ok: true, key };
}

export async function reviewCategory(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();
  if (!categorizationEnabled) return { error: "Not available yet." };

  const id = formData.get("id");
  const categoryId = formData.get("category");
  const categorySecondaryId = formData.get("categorySecondary");
  const note = formData.get("categoryNote");

  if (typeof id !== "string" || !id) return { error: "Something went wrong." };
  if (typeof categoryId !== "string" || !categoryId) return { error: "Pick a category." };

  const set: Record<string, unknown> = {
    category: { _type: "reference", _ref: categoryId },
    categoryReviewedAt: new Date().toISOString(),
  };
  const unset: string[] = [];

  if (typeof categorySecondaryId === "string" && categorySecondaryId) {
    set.categorySecondary = { _type: "reference", _ref: categorySecondaryId };
  } else {
    unset.push("categorySecondary");
  }
  if (typeof note === "string" && note.trim()) {
    set.categoryNote = note.trim();
  } else {
    unset.push("categoryNote");
  }

  try {
    let patch = sanityClient.patch(id).set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();
  } catch (error) {
    console.error("reviewCategory failed:", error);
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/site");
  return { ok: true, key: id };
}

export async function deleteContentItem(id: string): Promise<{ error?: string } | undefined> {
  await verifySession();

  try {
    await sanityClient.delete(id);
  } catch (error) {
    console.error("deleteContentItem failed:", error);
    return { error: "That didn't delete. Try again." };
  }

  revalidatePath("/site");
}

export async function updateContentItem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();

  const id = formData.get("id");
  const title = formData.get("title");
  const kind = formData.get("kind");
  const venue = formData.get("venue");
  const date = formData.get("date");
  const alsoShown = formData.get("alsoShown");
  const url = formData.get("url");
  const file = formData.get("file");
  const body = formData.get("body");
  const links = formData.get("links");
  const categoryId = formData.get("category");
  const categoryNote = formData.get("categoryNote");
  const description = formData.get("description");

  if (typeof id !== "string" || !id) return { error: "Something went wrong." };

  const set: Record<string, unknown> = {};
  const unset: string[] = [];

  /* "Details" (title, kind, venue, date, the source) only render as inputs
     once she opens the details editor — outside that, these simply aren't
     present in the form, so leave whatever's already saved untouched. */
  if (typeof title === "string") {
    if (!title.trim()) return { error: "Give this a title." };
    set.title = title.trim();

    /* Only check when the title actually changed — otherwise every save of an
       item that already has a twin would nag her. */
    if (formData.get("confirmDuplicate") !== "1") {
      try {
        const current = await sanityClient.fetch<string | null>(`*[_id == $id][0].title`, { id });
        if (normalizeTitle(current ?? "") !== normalizeTitle(title)) {
          const duplicates = await findDuplicateTitles(title, id);
          if (duplicates.length > 0) return { duplicates };
        }
      } catch {
        /* If the check itself fails, don't block her from saving. */
      }
    }
  }
  if (typeof kind === "string" && kind) {
    set.kind = kind;
    /* "Also show in the other list" only means something for Educational
       Content and Books; clear it for any other kind or when unchecked. */
    if ((kind === "educational-content" || kind === "book") && alsoShown === "on") {
      set.alsoShown = true;
    } else {
      unset.push("alsoShown");
    }
  }
  if (typeof venue === "string") {
    if (venue.trim()) set.venue = venue.trim();
    else unset.push("venue");
  }
  if (typeof date === "string") {
    if (date.trim()) set.date = date.trim();
    else unset.push("date");
  }

  /* The form only ever includes the one source field that matches this
     item's existing type (the modal renders just that one), so there's no
     both-or-neither case to guard against here the way create has to. */
  if (typeof url === "string" && url.trim()) {
    set.url = withHttps(url);
  }
  if (file instanceof File && file.size > 0) {
    try {
      const asset = await sanityClient.assets.upload("file", file, { filename: file.name });
      set.file = { _type: "file", asset: { _type: "reference", _ref: asset._id } };
    } catch (error) {
      console.error("updateContentItem failed:", error);
      return { error: "That file didn't upload. Try again." };
    }
  }
  if (typeof body === "string" && body.trim()) {
    const blocks = parsePortableText(body);
    if (blocks) set.body = blocks;
  }
  if (typeof links === "string") {
    const parsedLinks = parseLinks(links);
    if (parsedLinks && parsedLinks.length > 0) set.links = parsedLinks;
    else unset.push("links");
  }

  if (categorizationEnabled) {
    if (typeof categoryId === "string" && categoryId) {
      set.category = { _type: "reference", _ref: categoryId };
      /* Picking (or keeping) a category here is itself a review — it's what
         moves an item out of the review queue even if she never opens it. */
      set.categoryReviewedAt = new Date().toISOString();
    }
    if (typeof categoryNote === "string" && categoryNote.trim()) {
      set.categoryNote = categoryNote.trim();
    } else {
      unset.push("categoryNote");
    }
  }
  if (formData.get("hiddenPresent") === "1") {
    if (formData.get("hiddenFromSite") === "on") set.hiddenFromSite = true;
    else unset.push("hiddenFromSite");
  }
  if (typeof description === "string" && description.trim()) {
    set.description = description.trim();
  } else {
    unset.push("description");
  }

  try {
    let patch = sanityClient.patch(id).set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();
  } catch (error) {
    console.error("updateContentItem failed:", error);
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/site");
  return { ok: true };
}

/** Inline fix from the "Bot content gaps" page: only link and description.
 *  An empty field leaves what's saved alone — this view never clears content. */
export async function updateBotContent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();

  const id = formData.get("id");
  const url = formData.get("url");
  const description = formData.get("description");

  if (typeof id !== "string" || !id) return { error: "Something went wrong." };

  const set: Record<string, unknown> = {};
  if (typeof url === "string" && url.trim()) set.url = withHttps(url);
  if (typeof description === "string" && description.trim()) set.description = description.trim();
  if (Object.keys(set).length === 0) return { error: "Add a link or a description first." };

  try {
    await sanityClient.patch(id).set(set).commit();
  } catch (error) {
    console.error("updateBotContent failed:", error);
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/site");
  revalidatePath("/");
  return { ok: true, key: id };
}

/** Runs the link check for the "Check links" window. */
export async function checkLinks(): Promise<{ broken?: BrokenLink[]; checked?: number; error?: string }> {
  await verifySession();
  try {
    return await findBrokenLinks();
  } catch (error) {
    console.error("checkLinks failed:", error);
    return { error: "The check didn't run. Try again." };
  }
}

/** Saves one replacement link straight away (the window has no Save button). A link can be replaced, never cleared. */
export async function replaceLink(itemId: string, linkKey: string | null, url: string): Promise<{ error?: string; url?: string }> {
  await verifySession();
  const next = withHttps(url);
  try {
    if (!/^https?:\/\/[^\s/]+\.[^\s/]+/i.test(next) || new URL(next).hostname.length < 3) throw new Error("bad");
  } catch {
    return { error: "That doesn't look like a web address." };
  }
  try {
    const patch = sanityClient.patch(itemId);
    await (linkKey ? patch.set({ [`links[_key=="${linkKey}"].url`]: next }) : patch.set({ url: next })).commit();
  } catch (error) {
    console.error("replaceLink failed:", error);
    return { error: "That didn't save. Try again." };
  }
  revalidatePath("/site");
  return { url: next };
}

/** Takes an item off the public website (or puts it back). Nothing is deleted. */
export async function setItemHidden(itemId: string, hidden: boolean): Promise<{ error?: string }> {
  await verifySession();
  try {
    await sanityClient.patch(itemId).set({ hiddenFromSite: hidden }).commit();
  } catch (error) {
    console.error("setItemHidden failed:", error);
    return { error: "That didn't save. Try again." };
  }
  revalidatePath("/site");
  return {};
}
