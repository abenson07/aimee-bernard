import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

// Where Presentation loads the site. Override with SANITY_STUDIO_PREVIEW_URL
// (a deployed preview with visual editing on) when Aimee edits remotely.
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:4321";

export default defineConfig({
  name: "default",
  title: "Aimee Bernard",

  projectId: "18kcd13f",
  dataset: "production",

  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl,
      resolve: {
        locations: {
          pageCommunicator: {
            select: { title: "heroTitle" },
            resolve: () => ({ locations: [{ title: "Communicator", href: "/communicator" }] }),
          },
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Page documents are singletons: only fixed-ID edits, no "new document".
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== "pageCommunicator"),
    actions: (prev, { schemaType }) =>
      schemaType === "pageCommunicator"
        ? prev.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action))
        : prev,
  },
});
