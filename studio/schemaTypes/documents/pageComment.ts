import { CommentIcon } from "@sanity/icons/Comment";
import { defineField, defineType } from "sanity";

export const pageComment = defineType({
  name: "pageComment",
  title: "Page Comment",
  type: "document",
  icon: CommentIcon,
  // Written by the review overlay on the web app, not authored here — this
  // Studio view is for reading/resolving feedback, not creating comments.
  fields: [
    defineField({
      name: "pageVersion",
      title: "Page version",
      description:
        "Identifies which candidate design this comment belongs to, e.g. the git branch or preview deployment name (\"homepage-v2\").",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageSlug",
      title: "Page",
      description: 'Path of the page commented on, e.g. "/" or "/immunology".',
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "xPercent",
      title: "X position (%)",
      description:
        "Horizontal pin position as a fraction (0–1) of the full document width at the time of comment — not viewport pixels, so it replays correctly at any screen size.",
      type: "number",
      readOnly: true,
      validation: (rule) => rule.required().min(0).max(1),
    }),
    defineField({
      name: "yPercent",
      title: "Y position (%)",
      description:
        "Vertical pin position as a fraction (0–1) of the full document height at the time of comment.",
      type: "number",
      readOnly: true,
      validation: (rule) => rule.required().min(0).max(1),
    }),
    defineField({
      name: "viewportWidth",
      title: "Viewport width",
      description: "Commenter's viewport width in px at capture time — context only, not used for replay.",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "viewportHeight",
      title: "Viewport height",
      description: "Commenter's viewport height in px at capture time — context only, not used for replay.",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "screenshot",
      title: "Screenshot",
      description: "Cropped screenshot of the area around the pin at the time it was left.",
      type: "image",
      readOnly: true,
    }),
    defineField({
      name: "text",
      title: "Comment",
      type: "text",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      description: "Name of the person who left the comment (no login system — just a free-text name).",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Resolved", value: "resolved" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "pageSlug", version: "pageVersion", status: "status" },
    prepare: ({ title, subtitle, version, status }) => ({
      title,
      subtitle: `${subtitle} · ${version} · ${status}`,
    }),
  },
});
