import "server-only";
import { sanityClient } from "./sanity";

/** One link on one content item that didn't load. `linkKey` is the links[] row's _key, or null for the item's main url. */
export interface BrokenLink {
  itemId: string;
  title: string;
  kind?: string;
  venue?: string;
  linkKey: string | null;
  url: string;
  reason: string;
}

interface Row {
  _id: string;
  title: string;
  kind?: string;
  venue?: string;
  url?: string;
  links?: { _key: string; url?: string }[];
}

const TIMEOUT_MS = 8000;
const BATCH = 40;

/** Sites that turn away automated visitors answer 401/403/429/999 even when the page is fine,
 *  and so do server errors, so those don't count as broken. Only a missing page or an unreachable site does. */
async function problemWith(url: string): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return "Not a web address";
  const attempt = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "Mozilla/5.0 (compatible; LinkCheck/1.0)", accept: "text/html,*/*" },
    });
    return res.status;
  };
  try {
    let status = await attempt("HEAD");
    // Some servers refuse HEAD but serve the page fine.
    if (status === 404 || status === 405 || status >= 500) status = await attempt("GET");
    if (status === 404 || status === 410) return "Page not found";
    return null;
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") return "Took too long to load";
    return "Site can't be reached";
  }
}

/** Checks every web link on every visible content item. Files and written content have nothing to check. */
export async function findBrokenLinks(): Promise<{ broken: BrokenLink[]; checked: number }> {
  const rows = await sanityClient.fetch<Row[]>(
    `*[_type == "contentItem" && hiddenFromSite != true && !(_id in path("drafts.**"))]{ _id, title, kind, venue, url, links[]{_key, url} }`,
  );

  const jobs: Omit<BrokenLink, "reason">[] = [];
  for (const row of rows) {
    const base = { itemId: row._id, title: row.title, kind: row.kind, venue: row.venue };
    if (row.url) jobs.push({ ...base, linkKey: null, url: row.url });
    for (const link of row.links ?? []) if (link.url) jobs.push({ ...base, linkKey: link._key, url: link.url });
  }

  const broken: BrokenLink[] = [];
  for (let i = 0; i < jobs.length; i += BATCH) {
    const results = await Promise.all(jobs.slice(i, i + BATCH).map(async (job) => ({ job, reason: await problemWith(job.url) })));
    for (const { job, reason } of results) if (reason) broken.push({ ...job, reason });
  }
  /* Slow answers are often just a busy site, so give each one a second, unhurried look. */
  const confirmed: BrokenLink[] = [];
  for (const link of broken) {
    if (link.reason !== "Took too long to load") confirmed.push(link);
    else {
      const again = await problemWith(link.url);
      if (again) confirmed.push({ ...link, reason: again });
    }
  }
  return { broken: confirmed, checked: jobs.length };
}
