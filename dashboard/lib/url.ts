/** Adds https:// to a bare domain like "example.com" so the browser's native
 *  url-input validation (and Sanity's url field) accept it without the user
 *  having to type a scheme. Leaves anything that already has one alone. */
export function withHttps(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
