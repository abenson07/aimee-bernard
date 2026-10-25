/**
 * Editable page content for the designed pages ("Site page" documents in Sanity, edited in the
 * dashboard's Site editor). Every lookup takes a fallback, so a slot that is empty, or Sanity being
 * unreachable, leaves the page exactly as it is written in the code.
 *
 *   const site = await getSitePage("site-page-home", Astro.request);
 *   site.applyCaching(Astro.response);
 *   <h1 {...site.edit("hero-title")}>{site.text("hero-title", "Teaching immunology so it sticks")}</h1>
 *
 * Visitors get the published content. A request carrying a valid `?preview=` token (signed by the
 * dashboard) gets the draft, plus edit hooks for the dashboard's Site editor.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@sanity/client";
import { sanityClient } from "sanity:client";

type Hotspot = { x: number; y: number } | null;
type RawSlot = { _key: string; kind: string; text?: string | null; alt?: string | null; image?: { url: string; hotspot: Hotspot } | null };

export type SitePhoto = { src: string; srcset?: string; pos: string; alt: string };

const env = (name: string) => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

const b64url = (buf: Buffer) => buf.toString("base64url");

/** Tokens look like `<expiry seconds>.<signature>`; the dashboard signs them with the shared secret. */
export function verifyPreviewToken(token: string | null | undefined): boolean {
  const secret = env("SITE_PREVIEW_SECRET");
  if (!secret || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = b64url(createHmac("sha256", secret).update(exp).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const QUERY = `*[_id == $id][0]{ slots[]{ _key, kind, text, alt, "image": image{ "url": asset->url, hotspot } } }`;

async function readSlots(id: string, preview: boolean): Promise<Map<string, RawSlot>> {
  const slots = new Map<string, RawSlot>();
  try {
    let client = sanityClient;
    if (preview) {
      const token = env("SANITY_API_READ_TOKEN") ?? env("SANITY_API_WRITE_TOKEN");
      if (token) client = createClient({ ...sanityClient.config(), token, perspective: "drafts", useCdn: false });
    }
    const doc = await client.fetch<{ slots?: RawSlot[] } | null>(QUERY, { id });
    for (const s of doc?.slots ?? []) slots.set(s._key, s);
  } catch (err) {
    console.warn(`Site content for ${id} could not be read; using the built-in content.`, err);
  }
  return slots;
}

const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

export async function getSitePage(id: string, request: Request) {
  const token = new URL(request.url).searchParams.get("preview");
  const preview = verifyPreviewToken(token);
  const slots = await readSlots(id, preview);
  const dashboardOrigin = env("DASHBOARD_ORIGIN") ?? "";

  return {
    preview,
    dashboardOrigin,
    /** Text for a slot, or the fallback when it is empty. */
    text(key: string, fallback: string): string {
      const t = slots.get(key)?.text;
      return t && t.trim() ? t : fallback;
    },
    /** A photo for a slot (resized Sanity URLs with a focus point), or the fallback. */
    image(key: string, fallback: SitePhoto): SitePhoto {
      const s = slots.get(key);
      if (!s?.image?.url) return fallback;
      const u = s.image.url;
      const h = s.image.hotspot;
      return {
        src: `${u}?w=1600&auto=format`,
        srcset: [800, 1600, 2400].map((w) => `${u}?w=${w}&auto=format ${w}w`).join(", "),
        pos: h ? `${pct(h.x)} ${pct(h.y)}` : fallback.pos,
        alt: s.alt ?? fallback.alt,
      };
    },
    /** The widest version of a slot's photo, for backgrounds. */
    wideImage(key: string, fallback: SitePhoto): SitePhoto {
      const p = this.image(key, fallback);
      return p === fallback ? fallback : { ...p, src: p.src.replace("w=1600", "w=2400") };
    },
    /** Attributes that let the Site editor find a slot. Empty for visitors. `extras` are other slots
     *  shown with it in the editor (a hover photo and speech bubble that belong to a word, say). */
    edit(key: string, type: "text" | "image" = "text", extras: string[] = []): Record<string, string> {
      if (!preview) return {};
      const attrs: Record<string, string> = { "data-edit": `${id}:${key}`, "data-edit-type": type };
      if (extras.length) attrs["data-edit-extra"] = extras.join(" ");
      return attrs;
    },
    /** Text slot with line breaks: split on "\n" so the page can put a <br> between lines. */
    lines(key: string, fallback: string): string[] {
      return this.text(key, fallback).split("\n");
    },
    /** Visitors: cached a minute at the edge. Editor preview: never cached. */
    applyCaching(response: Response) {
      response.headers.set("Cache-Control", preview ? "private, no-store" : "public, s-maxage=60, stale-while-revalidate=300");
    },
  };
}

export type SitePage = Awaited<ReturnType<typeof getSitePage>>;
