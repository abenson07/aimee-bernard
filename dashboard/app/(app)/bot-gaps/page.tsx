import { sanityClient } from "@/lib/sanity";
import { BOT_KINDS, findBotGaps, type BotGapItem, type BotGapRow } from "@/lib/bot-gaps";
import { BotGaps } from "./bot-gaps";

const BOT_ITEMS_QUERY = `*[_type == "contentItem" && kind in $kinds] | order(date desc){
  _id,
  title,
  kind,
  venue,
  date,
  "href": coalesce(url, file.asset->url),
  description
}`;

export default async function BotGapsPage() {
  const rows = await sanityClient.fetch<BotGapRow[]>(BOT_ITEMS_QUERY, {
    kinds: BOT_KINDS.map((kind) => kind.value),
  });
  const gaps = rows.flatMap((row) => findBotGaps(row) ?? []);

  const groups = BOT_KINDS.map((kind) => ({
    kind: kind.value,
    title: kind.title,
    total: rows.filter((row) => row.kind === kind.value).length,
    items: gaps.filter((item) => item.kind === kind.value) as BotGapItem[],
  }));

  return <BotGaps groups={groups} />;
}
