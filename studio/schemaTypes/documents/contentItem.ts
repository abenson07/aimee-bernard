import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

const KIND_OPTIONS = [
  { title: "Talk", value: "talk" },
  { title: "Podcast", value: "podcast" },
  { title: "Press Mentions", value: "press-mentions" },
  { title: "Article", value: "article" },
  { title: "Educational Content", value: "educational-content" },
  { title: "Position", value: "position" },
  { title: "Course", value: "course" },
  { title: "Award", value: "award" },
  { title: "Research Publication", value: "research-publication" },
];

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
      name: "kind",
      title: "Kind",
      description: "What type of content this is.",
      type: "string",
      options: { list: KIND_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "uncertain",
      title: "Uncertain",
      description: "Check this if the kind above is a best guess, not a clear fit.",
      type: "boolean",
      initialValue: false,
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
      name: "venue",
      title: "Venue",
      description: "Where this happened or was published — an event, publication, or organization.",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "Date",
      description:
        "Free text, as precise as it's actually known — e.g. \"April 2026\", \"2023\", \"2020-current\".",
      type: "string",
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      description: "For items that ran over a range, like a position or course. Leave blank otherwise.",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "End date",
      description: "Leave blank if still ongoing.",
      type: "date",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "link",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "topics",
      title: "Topics",
      description: "Individual lecture or session titles, mainly for courses.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "relatedItems",
      title: "Related items",
      description: "Other content items this connects to — a repeat talk, a position and its courses, etc.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "contentItem" }] })],
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
      name: "categorySecondary",
      title: "Secondary category",
      description: "Only when this item genuinely does a second category's job too. Most items don't need one.",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "categoryNote",
      title: "Category note",
      description:
        "Aimee's own reasoning for the category above — especially why she moved it away from the suggestion below.",
      type: "text",
    }),
    defineField({
      name: "categorySuggested",
      title: "Suggested category",
      description:
        "The classification pass's original suggested primary category. Frozen once set — never edited after the fact, so it stays a true record of what was suggested.",
      type: "reference",
      to: [{ type: "category" }],
      readOnly: true,
    }),
    defineField({
      name: "categorySuggestedSecondary",
      title: "Suggested secondary category",
      description: "The classification pass's suggested secondary category, if any. Also frozen.",
      type: "reference",
      to: [{ type: "category" }],
      readOnly: true,
    }),
    defineField({
      name: "categoryRationale",
      title: "Suggested category rationale",
      description: "Why the classification pass suggested this category. Frozen alongside the suggestion above.",
      type: "text",
      readOnly: true,
    }),
    defineField({
      name: "categoryFlaggedForReview",
      title: "Flagged for review",
      description: "The classification pass thought this one was a close call, worth a second look.",
      type: "boolean",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "categoryReviewedAt",
      title: "Category reviewed at",
      description: "Set the first time the category above is confirmed or changed. Empty means still pending review.",
      type: "datetime",
    }),
  ],
  validation: (rule) =>
    rule.custom((fields) => {
      const sources = [
        Boolean(fields?.file),
        Boolean(fields?.url),
        Boolean(Array.isArray(fields?.body) && fields.body.length > 0),
      ].filter(Boolean);

      if (sources.length > 1) {
        return "Provide at most one of: a file, a URL, or written content.";
      }
      return true;
    }),
  preview: {
    select: { title: "title", subtitle: "venue", media: "file" },
  },
});
