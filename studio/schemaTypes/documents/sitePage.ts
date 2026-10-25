import { defineArrayMember, defineField, defineType } from "sanity";

// One document per designed page (fixed IDs like "site-page-home"). Each holds a list of named
// "slots": a headline, a short paragraph, or a photo. The site looks a slot up by its key and falls
// back to the text or photo written in the page's code if the slot is empty.
//
// These documents are edited in the dashboard's Site editor (click a photo or heading on the live
// page). Studio shows them too, as a backup.
export const sitePage = defineType({
  name: "sitePage",
  title: "Site page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Page", type: "string", readOnly: true }),
    defineField({
      name: "slots",
      title: "Editable parts of the page",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "siteSlot",
          fields: [
            defineField({ name: "label", title: "What it is", type: "string", readOnly: true }),
            defineField({
              name: "kind",
              title: "Kind",
              type: "string",
              readOnly: true,
              options: { list: ["text", "longtext", "image"] },
            }),
            defineField({ name: "text", title: "Text", type: "text", rows: 3, hidden: ({ parent }) => parent?.kind === "image" }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }) => parent?.kind !== "image",
            }),
            defineField({ name: "alt", title: "Photo description (for screen readers)", type: "string", hidden: ({ parent }) => parent?.kind !== "image" }),
          ],
          preview: { select: { title: "label", subtitle: "text", media: "image" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "title" } },
});
