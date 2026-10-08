// Maps a venue name to a logo in /public/site/logos. First match wins.
const RULES: Array<[RegExp, string]> = [
  [/tedx/i, "tedx.svg"],
  [/unbiased science/i, "unbiased-science.webp"],
  [/project bridge/i, "project-bridge.png"],
  [/immunology explained/i, "immunology-explained.png"],
  [/american association of immunologists|\bAAI\b/i, "aai.png"],
  [/the conversation/i, "the-conversation.svg"],
  [/medpage/i, "medpagetoday.svg"],
  [/huffpost/i, "huffpost.svg"],
  [/^self$/i, "self.svg"],
  [/\bkoa\b/i, "koa.png"],
  [/rochester/i, "rochester.svg"],
  [/^cu denver/i, "cu-denver.png"],
  [/^cu\b|^school of medicine|anschutz/i, "cu-anschutz.png"],
];

export function outletLogo(venue: string | null | undefined): string | null {
  if (!venue) return null;
  const hit = RULES.find(([re]) => re.test(venue.trim()));
  return hit ? `/site/logos/${hit[1]}` : null;
}
