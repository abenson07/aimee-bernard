/** Shared by every database-backed island: Vercel caches the result for a minute and refreshes it in the background. */
export const ISLAND_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

/** A Sanity image URL, resized and served in a modern format. */
export const photo = (url: string | null | undefined, width: number) => (url ? `${url}?w=${width}&auto=format` : null);
