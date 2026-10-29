import "server-only";
import { sanityClient } from "@/lib/sanity";
import { normalizeTitle } from "@/lib/titles";
import type { DuplicateMatch } from "@/lib/types";

/** Existing content items whose title matches `title` once capitals, accents,
 *  punctuation and a leading "the/a/an" are ignored. Skips `excludeId` (the
 *  item being edited). Drafts are ignored. */
export async function findDuplicateTitles(
  title: string,
  excludeId?: string,
): Promise<DuplicateMatch[]> {
  const wanted = normalizeTitle(title);
  if (!wanted) return [];

  /* GROQ can't strip accents or punctuation, so pull every title and compare
     here. The list is small (a few hundred items). */
  const items = await sanityClient.fetch<(DuplicateMatch & { title?: string })[]>(
    `*[_type == "contentItem" && !(_id in path("drafts.**")) && _id != $excludeId]{
      _id, title, kind, venue, date
    }`,
    { excludeId: excludeId ?? "" },
  );

  return items.filter((item) => item.title && normalizeTitle(item.title) === wanted);
}
