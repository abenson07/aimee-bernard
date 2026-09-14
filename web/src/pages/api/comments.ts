// brief: web/docs/content-plan.md#review--commenting-system
// Backs the review overlay (src/components/ReviewOverlay.astro): GET reads
// back existing pins for a page/version, POST creates a new one. Runs on the
// server so the Sanity write token never reaches the browser.
import type { APIRoute } from "astro";
import { sanityWriteClient } from "@/lib/sanityWriteClient";
import { urlFor } from "@/utils/sanity";

export const prerender = false;

type PageCommentDoc = {
  _id: string;
  xPercent: number;
  yPercent: number;
  viewportWidth?: number;
  viewportHeight?: number;
  screenshot?: unknown;
  text: string;
  author: string;
  status: "open" | "resolved";
  createdAt: string;
};

function serialize(doc: PageCommentDoc) {
  return {
    id: doc._id,
    xPercent: doc.xPercent,
    yPercent: doc.yPercent,
    viewportWidth: doc.viewportWidth,
    viewportHeight: doc.viewportHeight,
    screenshotUrl: doc.screenshot ? urlFor(doc.screenshot as never).width(480).url() : null,
    text: doc.text,
    author: doc.author,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const pageVersion = url.searchParams.get("pageVersion");
  const pageSlug = url.searchParams.get("pageSlug");

  if (!pageVersion || !pageSlug) {
    return new Response(JSON.stringify({ error: "pageVersion and pageSlug are required" }), {
      status: 400,
    });
  }

  const comments = await sanityWriteClient.fetch<PageCommentDoc[]>(
    `*[_type == "pageComment" && pageVersion == $pageVersion && pageSlug == $pageSlug] | order(createdAt asc)`,
    { pageVersion, pageSlug },
  );

  return new Response(JSON.stringify(comments.map(serialize)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { pageVersion, pageSlug, xPercent, yPercent, viewportWidth, viewportHeight, text, author, screenshotDataUrl } =
    body ?? {};

  if (
    typeof pageVersion !== "string" ||
    typeof pageSlug !== "string" ||
    typeof xPercent !== "number" ||
    typeof yPercent !== "number" ||
    typeof text !== "string" ||
    typeof author !== "string"
  ) {
    return new Response(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 });
  }

  try {
    let screenshotAsset;
    if (typeof screenshotDataUrl === "string") {
      const match = screenshotDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const [, contentType, base64] = match;
        const buffer = Buffer.from(base64, "base64");
        screenshotAsset = await sanityWriteClient.assets.upload("image", buffer, { contentType });
      }
    }

    const doc = await sanityWriteClient.create({
      _type: "pageComment",
      pageVersion,
      pageSlug,
      xPercent,
      yPercent,
      viewportWidth: typeof viewportWidth === "number" ? viewportWidth : undefined,
      viewportHeight: typeof viewportHeight === "number" ? viewportHeight : undefined,
      screenshot: screenshotAsset
        ? { _type: "image", asset: { _type: "reference", _ref: screenshotAsset._id } }
        : undefined,
      text,
      author,
      status: "open",
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(serialize(doc as PageCommentDoc)), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/comments failed", err);
    return new Response(JSON.stringify({ error: "Failed to save comment" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
