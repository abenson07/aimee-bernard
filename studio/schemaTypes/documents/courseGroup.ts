import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";

const ICON_OPTIONS = [
  { title: "Lab coat", value: "lab-coat" },
  { title: "Stethoscope", value: "stethoscope" },
  { title: "Tooth", value: "tooth" },
  { title: "Microscope", value: "microscope" },
  { title: "Vaccine", value: "vaccine" },
  { title: "Medical bag", value: "medical-bag" },
  { title: "Vaccine with heart", value: "vaccine-heart" },
  { title: "T cell with graduation cap", value: "t-cell-grad" },
];

export const courseGroup = defineType({
  name: "courseGroup",
  title: "Course Group",
  description: "One tile in the Courses section of the Educator page, and the panel that opens from it.",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "order",
      title: "Order",
      description: "Tiles are shown from the lowest number to the highest.",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "icon", title: "Tile icon", type: "string", options: { list: ICON_OPTIONS } }),
    defineField({
      name: "tileMeta",
      title: "Tile lines",
      description: "The small lines under the name on the tile, one per line (role and years, for example).",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "pill", title: "Panel label", description: "For example: Immunology — Content Director", type: "string" }),
    defineField({ name: "dates", title: "Panel dates", description: "For example: 2020–current · Years 1–4", type: "string" }),
    defineField({ name: "intro", title: "Panel intro", type: "text", rows: 3 }),
    defineField({ name: "body", title: "Panel text", type: "text", rows: 4 }),
    defineField({
      name: "tags",
      title: "Panel tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "image",
      title: "Panel photo",
      description: "Optional. The panel shows a stock photo if this is empty.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "years",
      title: "Years",
      description: "The sections inside the panel, in order. Each lists the courses taught in that stretch.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "courseYear",
          fields: [
            defineField({ name: "label", title: "Label", description: "For example: YEAR 1. The ‘Plains’", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({ name: "linkUrl", title: "Course details link", type: "url" }),
            defineField({
              name: "courses",
              title: "Courses",
              type: "array",
              of: [defineArrayMember({ type: "reference", to: [{ type: "contentItem" }] })],
            }),
          ],
          preview: { select: { title: "label" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", subtitle: "dates" } },
});
