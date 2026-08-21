import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

export const contentItem = defineType({
  name: "contentItem",
  title: "Content Item",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      name: "body",
      title: "Content",
      description: "Written content, for items that are neither a file nor a link.",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "Left empty during intake. Items get sorted in a later pass, once the categories are defined.",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "categoryNote",
      title: "Category note",
      description: "Notes on why this item might belong in a different category than assigned.",
      type: "text",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
  ],
  validation: (rule) =>
    rule.custom((fields) => {
      const sources = [
        Boolean(fields?.file),
        Boolean(fields?.url),
        Boolean(Array.isArray(fields?.body) && fields.body.length > 0),
      ].filter(Boolean);

      if (sources.length !== 1) {
        return "Provide exactly one of: a file, a URL, or written content.";
      }
      return true;
    }),
  preview: {
    select: { title: "title", subtitle: "url", media: "file" },
  },
});
