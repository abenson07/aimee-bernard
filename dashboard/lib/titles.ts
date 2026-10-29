/** Turns a title into a plain form so two titles that only differ by capital
 *  letters, accents, punctuation, curly vs straight quotes, extra spaces or a
 *  leading "a / an / the" come out identical. */
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toLowerCase()
    .replace(/['"`‘’‚‛“”„′´]/g, "") // quotes, straight or curly
    .replace(/[^\p{L}\p{N}]+/gu, " ") // other punctuation becomes a space
    .trim()
    .replace(/^(a|an|the)\s+/, "")
    .replace(/\s+/g, " ");
}

export function sameTitle(a: string, b: string): boolean {
  const left = normalizeTitle(a);
  return left !== "" && left === normalizeTitle(b);
}
