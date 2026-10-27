import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

const KIND_OPTIONS = [
  { title: "Talk", value: "talk" },
  { title: "Podcast", value: "podcast" },
  { title: "Press Mentions", value: "press-mentions" },
  { title: "Article", value: "article" },
  { title: "Educational Content", value: "educational-content" },
  { title: "Book", value: "book" },
  { title: "Position", value: "position" },
  { title: "Course", value: "course" },
  { title: "Award", value: "award" },
  { title: "Research Publication", value: "research-publication" },
  { title: "Social", value: "social" },
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
      name: "alsoShown",
      title: "Also show in the other list",
      description:
        "For Educational Content: also show this in the Books box. For a Book: also show it in Educational Content.",
      type: "boolean",
      initialValue: false,
      hidden: ({ document }) => document?.kind !== "educational-content" && document?.kind !== "book",
    }),
    defineField({
      name: "awardGroup",
      title: "Award group",
      description: "Which awards section this award appears in. Each section shows the six most recent.",
      type: "string",
      options: {
        list: [
          { title: "Teaching awards", value: "teaching" },
          { title: "Outreach & mentoring awards", value: "outreach" },
        ],
      },
      hidden: ({ document }) => document?.kind !== "award",
    }),
    defineField({
      name: "featuredOnCommunicator",
      title: "Feature on Communicator page",
      description:
        "Turn this on to show this item in the large feature section on the Communicator page. If more than one item is on, the most recently updated one shows.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featuredInSearch",
      title: "Feature in search",
      description:
        "Turn this on to show this item first when someone asks the B cell on the site. Keep it to three or fewer: if everything is featured, nothing stands out.",
      type: "boolean",
      initialValue: false,
      validation: (rule) =>
        rule
          .custom(async (value, context) => {
            if (!value) return true;
            const client = context.getClient({ apiVersion: "2024-01-01" });
            const id = (context.document?._id ?? "").replace(/^drafts\./, "");
            const others: number = await client.fetch(
              `count(*[_type == "contentItem" && featuredInSearch == true && !(_id in [$id, "drafts." + $id])])`,
              { id },
            );
            return others >= 3 ? "Three other items are already featured. Turn one of them off so this one stands out." : true;
          })
          .warning(),
    }),
    defineField({
      name: "uncertain",
      title: "Uncertain",
      description: "Check this if the kind above is a best guess, not a clear fit.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Image",
      description: "Optional. Shown when someone hovers this item's card on the Work page. Leave empty if there isn't one.",
      type: "image",
      options: { hotspot: true },
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
      name: "publication",
      title: "Publication",
      description:
        "Only for press mentions and other outside media — links this item to a publication record so its logo can display. Leave blank for talks, courses, and other non-press items.",
      type: "reference",
      to: [{ type: "publication" }],
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
