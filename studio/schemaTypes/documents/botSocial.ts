import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";
import { validLink } from "./botFact";

export const botSocial = defineType({
  name: "botSocial",
  title: "Bot social link",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Name of the place",
      description: "For example: Instagram",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "handle",
      title: "Handle",
      description: "How it appears there, for example @funsizeimmuninja",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Link",
      description: "The full web address of her page there.",
      type: "string",
      validation: (rule) => rule.required().custom(validLink),
    }),
    defineField({
      name: "words",
      title: "Words people use for it",
      description: "What a visitor might type to ask about it, like insta or ig. One per line.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: { select: { title: "label", subtitle: "handle" } },
});
