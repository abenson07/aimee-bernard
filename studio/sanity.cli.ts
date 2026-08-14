import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "18kcd13f",
    dataset: "production",
  },
  deployment: {
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: "../web/src/**/*.{ts,tsx,js,jsx,astro}",
    schema: "schema.json",
    generates: "../web/sanity.types.ts",
    overloadClientMethods: true,
  },
});
