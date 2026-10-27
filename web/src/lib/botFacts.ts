// Turns the "Bot fact" and "Bot social link" documents Aimee edits in Studio into the shapes the
// Ask bot engine reads (see data/aimee-facts.ts). Kept free of Sanity imports so it is easy to test.
import type { BotFact } from "@/data/aimee-facts";

export type SocialLink = { id: string; label: string; handle: string; href: string; words: string[] };

export type BotFactDoc = {
  _id: string;
  phrases?: (string | null)[] | null;
  answer?: (string | null)[] | null;
  links?: { label?: string | null; url?: string | null }[] | null;
};

export type BotSocialDoc = {
  _id: string;
  label?: string | null;
  handle?: string | null;
  url?: string | null;
  words?: (string | null)[] | null;
};

/** What the engine compares against: lower case, letters and digits only, single spaces. */
export function plain(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A phrase as a pattern the engine can use. Only plain words survive, so nothing typed in Studio can break matching. */
export function phrasePattern(phrase: string): string {
  return escapeRe(plain(phrase));
}

/** A page on the site stays as is; a bare web address gets https://. */
export function normalizeHref(raw: string): string {
  const v = raw.trim();
  if (/^(\/|https?:\/\/|mailto:)/i.test(v)) return v;
  return /^[\w-]+(\.[\w-]+)+(\/|$)/.test(v) ? `https://${v}` : `/${v.replace(/^\/+/, "")}`;
}

const clean = (xs?: (string | null)[] | null) => (xs ?? []).map((x) => (x ?? "").trim()).filter(Boolean);

export function factsFromDocs(docs: BotFactDoc[]): BotFact[] {
  const out: BotFact[] = [];
  for (const d of docs) {
    const match = [...new Set(clean(d.phrases).map(phrasePattern).filter(Boolean))];
    const answer = clean(d.answer);
    if (!match.length || !answer.length) continue;
    const links = (d.links ?? [])
      .filter((l) => l.label?.trim() && l.url?.trim())
      .map((l) => ({ label: l.label!.trim(), href: normalizeHref(l.url!) }));
    out.push({ id: d._id, match, answer, ...(links.length ? { links } : {}) });
  }
  return out;
}

export function socialsFromDocs(docs: BotSocialDoc[]): SocialLink[] {
  const out: SocialLink[] = [];
  for (const d of docs) {
    const label = d.label?.trim();
    const handle = d.handle?.trim();
    const url = d.url?.trim();
    if (!label || !handle || !url) continue;
    const words = [...new Set([...clean(d.words).map(plain), plain(label)].filter(Boolean))].map(escapeRe);
    out.push({ id: plain(label).replace(/ /g, "-"), label, handle, href: normalizeHref(url), words });
  }
  return out;
}
