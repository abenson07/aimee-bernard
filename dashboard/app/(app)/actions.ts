"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { categorizationEnabled } from "@/lib/flags";
import { sanityClient } from "@/lib/sanity";
import { SESSION_COOKIE } from "@/lib/session";
import { withHttps } from "@/lib/url";

export type FormState = { error?: string; ok?: boolean; key?: string } | undefined;

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

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Give this a title." };
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

  const doc: { _type: string } & Record<string, unknown> = {
    _type: "contentItem",
    title: title.trim(),
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
  } catch {
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/");
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
  } catch {
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/");
  return { ok: true, key };
}

export async function updateContentItem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();

  const id = formData.get("id");
  const title = formData.get("title");
  const url = formData.get("url");
  const file = formData.get("file");
  const body = formData.get("body");
  const categoryId = formData.get("category");
  const categoryNote = formData.get("categoryNote");
  const description = formData.get("description");

  if (typeof id !== "string" || !id) return { error: "Something went wrong." };
  if (typeof title !== "string" || !title.trim()) {
    return { error: "Give this a title." };
  }

  const set: Record<string, unknown> = { title: title.trim() };
  const unset: string[] = [];

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
    } catch {
      return { error: "That file didn't upload. Try again." };
    }
  }
  if (typeof body === "string" && body.trim()) {
    const blocks = parsePortableText(body);
    if (blocks) set.body = blocks;
  }

  if (categorizationEnabled) {
    if (typeof categoryId === "string" && categoryId) {
      set.category = { _type: "reference", _ref: categoryId };
    }
    if (typeof categoryNote === "string" && categoryNote.trim()) {
      set.categoryNote = categoryNote.trim();
    } else {
      unset.push("categoryNote");
    }
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
  } catch {
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
