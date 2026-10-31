import "server-only";
import { createHmac } from "node:crypto";

/** The pages the Site editor can open. `id` is the Sanity document id; `path` is the page on the live site. */
export const SITE_PAGES = [
  { id: "site-page-home", title: "Home", path: "/" },
  { id: "site-page-educator", title: "Educator", path: "/educator" },
  { id: "site-page-communicator", title: "Communicator", path: "/communicator" },
  { id: "site-page-immunologist", title: "Immunologist", path: "/immunology" },
  { id: "site-page-work", title: "Work", path: "/work" },
  { id: "site-page-outreach", title: "Outreach", path: "/community-outreach" },
  { id: "site-page-contact", title: "Contact", path: "/contact" },
] as const;

export type SitePageId = (typeof SITE_PAGES)[number]["id"];

export function sitePageTitle(id: string) {
  return SITE_PAGES.find((p) => p.id === id)?.title ?? id;
}

export function isSitePageId(id: unknown): id is SitePageId {
  return typeof id === "string" && SITE_PAGES.some((p) => p.id === id);
}

/** Slot keys are plain lowercase words and dashes (they go into a Sanity patch path). */
export function isSlotKey(key: unknown): key is string {
  return typeof key === "string" && /^[a-z0-9-]{1,60}$/.test(key);
}

/** A short-lived token the live site checks before it shows a draft and the edit hooks.
 *  Format: `<expiry seconds>.<base64url HMAC-SHA256 of the expiry>`, the same as web/src/lib/siteContent.ts. */
export function signPreviewToken(lifetimeSeconds = 2 * 60 * 60) {
  const secret = process.env.SITE_PREVIEW_SECRET;
  if (!secret) throw new Error("SITE_PREVIEW_SECRET is not set");
  const exp = String(Math.floor(Date.now() / 1000) + lifetimeSeconds);
  return `${exp}.${createHmac("sha256", secret).update(exp).digest("base64url")}`;
}

export function siteUrl(path: string, token: string) {
  const base = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  return `${base}${path}?preview=${encodeURIComponent(token)}`;
}
