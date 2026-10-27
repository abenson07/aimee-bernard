/* Which Work items the "Ask me a Q?" bot answers poorly. It builds its answers
   from contentItem records (web/src/lib/askIndex.ts), where a link is
   coalesce(url, file.asset->url) and the description is quoted as-is. */

export const BOT_KINDS = [
  { value: "podcast", title: "Podcasts" },
  { value: "talk", title: "Talks" },
  { value: "article", title: "Articles" },
  { value: "press-mentions", title: "Press mentions" },
  { value: "award", title: "Awards" },
] as const;

export const THIN_DESCRIPTION_LENGTH = 40;

export type BotGapField = "link" | "description";

export interface BotGapRow {
  _id: string;
  title?: string;
  kind: string;
  venue?: string;
  date?: string;
  href?: string;
  description?: string;
}

export interface BotGapItem extends BotGapRow {
  missing: BotGapField[];
  descriptionIssue?: "empty" | "thin" | "written-by";
}

export function findBotGaps(row: BotGapRow): BotGapItem | null {
  const missing: BotGapField[] = [];
  let descriptionIssue: BotGapItem["descriptionIssue"];

  if (!row.href?.trim()) missing.push("link");

  const description = row.description?.trim() ?? "";
  if (!description) descriptionIssue = "empty";
  else if (description.startsWith("Written by")) descriptionIssue = "written-by";
  else if (description.length < THIN_DESCRIPTION_LENGTH) descriptionIssue = "thin";
  if (descriptionIssue) missing.push("description");

  return missing.length ? { ...row, missing, descriptionIssue } : null;
}
