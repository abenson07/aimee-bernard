import { DoubleQuoteIcon } from "@sanity/icons/DoubleQuote";
import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: DoubleQuoteIcon,
  fields: [
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      description: "How the speaker relates to Aimee — their title and/or lab.",
      type: "string",
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "speaker", subtitle: "role" },
  },
});
