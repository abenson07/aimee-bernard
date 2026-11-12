/** What she sees when a request never got an answer (the host refused it, the
 *  connection dropped, the page was left open too long). Without this a
 *  rejected server action throws past the form and nothing happens on screen. */
export const REQUEST_FAILED = "That didn't save. Check your connection and try again. If it keeps happening, tell Alex.";

/** Wraps a server action used with useActionState so a rejected request comes
 *  back as `{ error }` (shown like any other error) instead of throwing. */
export function guardAction<State extends { error?: string } | undefined, Args extends unknown[]>(
  action: (prev: State, ...args: Args) => Promise<State>,
): (prev: State, ...args: Args) => Promise<State> {
  return async (prev, ...args) => {
    try {
      return await action(prev, ...args);
    } catch {
      return { error: REQUEST_FAILED } as State;
    }
  };
}

/** For server actions called directly: returns the action's own result, or
 *  `{ error }` if the request itself failed. */
export async function callAction<T extends { error?: string } | { ok: boolean; error?: string }>(
  run: () => Promise<T>,
): Promise<T | { ok: false; error: string }> {
  try {
    return await run();
  } catch {
    return { ok: false, error: REQUEST_FAILED };
  }
}
