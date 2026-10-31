import { sanityClient } from "@/lib/sanity";
import { BOT_KINDS, findBotGaps, type BotGapItem, type BotGapRow } from "@/lib/bot-gaps";

const BOT_ITEMS_QUERY = `*[_type == "contentItem" && kind in $kinds] | order(date desc){
  _id,
  title,
  kind,
  venue,
  date,
  "href": coalesce(url, file.asset->url),
  description
}`;

/** The "Bot content gaps" list, grouped by kind (shown inside the Site editor). */
export async function loadBotGapGroups() {
  const rows = await sanityClient.fetch<BotGapRow[]>(BOT_ITEMS_QUERY, {
    kinds: BOT_KINDS.map((kind) => kind.value),
  });
  const gaps = rows.flatMap((row) => findBotGaps(row) ?? []);
  return BOT_KINDS.map((kind) => ({
    kind: kind.value,
    title: kind.title,
    total: rows.filter((row) => row.kind === kind.value).length,
    items: gaps.filter((item) => item.kind === kind.value) as BotGapItem[],
  }));
}
