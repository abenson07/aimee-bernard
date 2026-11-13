import { useSyncExternalStore } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How a "last updated" time reads in the content log. Recent times are spoken ("27 minutes ago");
 *  a week or older becomes the actual date. `exact` is the full date and time for the hover tooltip,
 *  and is null once the text is already the actual date. */
export function humanizeTime(iso: string, now: number): { text: string; exact: string | null } {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return { text: "—", exact: null };
  const exact = new Date(then).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
  /* A clock a little ahead of the server's reads as "just now", not as a time in the future. */
  const age = Math.max(0, now - then);
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;

  if (age < 45 * SECOND) return { text: "a few seconds ago", exact };
  if (age < 5 * MINUTE) return { text: "a few minutes ago", exact };
  if (age < HOUR) return { text: plural(Math.floor(age / MINUTE), "minute"), exact };
  if (age < DAY) return { text: plural(Math.floor(age / HOUR), "hour"), exact };
  if (age < 7 * DAY) return { text: plural(Math.floor(age / DAY), "day"), exact };

  const date = new Date(then);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return {
    text: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: sameYear ? undefined : "numeric" }),
    exact: null,
  };
}

const TICK = 30 * SECOND;
const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, TICK);
  return () => clearInterval(timer);
};

/** The current time, refreshed every 30 seconds so "2 minutes ago" keeps moving. Returns 0 while the
 *  page is first being drawn on the server, so the server and the browser agree and nothing flickers. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK) * TICK,
    () => 0,
  );
}
