import { defineArrayMember, defineField, defineType } from "sanity";

// Singleton: one document, fixed ID "pageCommunicator" (see structure.ts).
// Edited through Presentation (click a section on the live page), and kept
// out of the dashboard, which only reads `contentItem` and `category`.
export const pageCommunicator = defineType({
  name: "pageCommunicator",
  title: "Communicator page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "stats", title: "Numbers" },
    { name: "contributes", title: "Regularly contributes to" },
  ],
  fields: [
    defineField({ name: "heroTitle", title: "Title", type: "string", group: "hero" }),
    defineField({ name: "heroBlurb", title: "Blurb", type: "text", rows: 3, group: "hero" }),
    defineField({
      name: "stats",
      title: "Numbers",
      type: "array",
      group: "stats",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", title: "Number", description: "e.g. 25+", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({ name: "contributesHeading", title: "Heading", type: "string", group: "contributes" }),
    defineField({
      name: "contributesCards",
      title: "Cards",
      type: "array",
      group: "contributes",
      of: [
        defineArrayMember({
          type: "object",
          name: "contributesCard",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "role", title: "Role", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Communicator page" }) },
});
