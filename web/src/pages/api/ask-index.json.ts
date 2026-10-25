// The index the "Ask me a Q?" bot searches (see lib/askIndex.ts). Rendered on request so dashboard
// edits show up without a redeploy; cached for five minutes.
import type { APIRoute } from "astro";
import { buildAskIndex } from "@/lib/askIndex";

export const prerender = false;

export const GET: APIRoute = async () => {
  const body = await buildAskIndex();
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
};
