import type { NextConfig } from "next";

/* The marketing site owns the domain root, so the dashboard is served from a
 * sub-path and proxied there by the site's rewrites. Baked in at build time. */
const basePath = "/dashboard";

/* Behind that proxy the browser's Origin is the site's domain while this app
 * sees its own host, which would otherwise trip the Server Action origin
 * check. Set DASHBOARD_PUBLIC_HOST to the public hostname (no protocol). */
const publicHost = process.env.DASHBOARD_PUBLIC_HOST;

const nextConfig: NextConfig = {
  basePath,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
      ...(publicHost ? { allowedOrigins: [publicHost] } : {}),
    },
  },
};

export default nextConfig;
