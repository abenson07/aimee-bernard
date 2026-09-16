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
import type { ContentItem } from "@/lib/types";

export type FormState = {
  error?: string;
  ok?: boolean;
  key?: string;
  item?: ContentItem;
} | undefined;

function writeErrorMessage(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  const status =
    error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : undefined;

  if (status === 401 || /unauthorized|session not found/i.test(message)) {
    return "Sanity refused the write. SANITY_API_WRITE_TOKEN on Vercel must be an Editor token, not Viewer.";
  }
  if (status === 402 || /quota|plan_limit/i.test(message)) {
    return "Sanity hit a plan limit, so this file can't be stored right now.";
  }
  if (message) return message;
  return "That didn't save. Try again.";
}

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

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return { error: "Missing SANITY_API_WRITE_TOKEN. Add an Editor token on the Vercel project." };
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

    const created = await sanityClient.create(doc);
    revalidatePath("/");
    return {
      ok: true,
      item: {
        _id: created._id,
        _createdAt: created._createdAt,
        title: title.trim(),
        url: typeof created.url === "string" ? created.url : undefined,
        description: typeof created.description === "string" ? created.description : undefined,
        fileName: hasFile && file instanceof File ? file.name : undefined,
        hasBody: Boolean(blocks),
        categoryId:
          typeof categoryId === "string" && categoryId ? categoryId : undefined,
      },
    };
  } catch (error) {
    console.error("createContentItem failed", error);
    return { error: writeErrorMessage(error) };
  }
}

export async function deleteContentItem(id: string): Promise<{ error?: string } | undefined> {
  await verifySession();

  try {
    await sanityClient.delete(id);
  } catch (error) {
    console.error("deleteContentItem failed", error);
    return { error: writeErrorMessage(error) };
  }

  revalidatePath("/");
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
  const categoryId = formData.get("category");
  const categoryNote = formData.get("categoryNote");
  const description = formData.get("description");

  if (typeof id !== "string" || !id) return { error: "Something went wrong." };

  const set: Record<string, unknown> = {};
  const unset: string[] = [];

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
