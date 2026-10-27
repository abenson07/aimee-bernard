import { CommentIcon } from "@sanity/icons/Comment";
import { defineArrayMember, defineField, defineType } from "sanity";

// Where a link may point: a page on the site (/contact) or a full web address.
export function validLink(value?: string) {
  if (!value) return true;
  if (/^\/[\w\-/#?=&.]*$/.test(value) || /^(https?:\/\/|mailto:)\S+$/.test(value)) return true;
  return "Use a page on the site, like /contact, or a full web address starting with https://";
}

export const botFact = defineType({
  name: "botFact",
  title: "Bot fact",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Name",
      description: "Just a label so you can find this in the list. Visitors never see it.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phrases",
      title: "When someone asks about…",
      description:
        "Short phrases a visitor might type, written the way they would say it. For example: what does she teach. Add as many as you like, one per line. The bot answers when a question contains one of them.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description: "One or two short sentences. Use a separate line for each sentence.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => [rule.required().min(1), rule.max(3).warning("Shorter is better. One or two sentences is usually plenty.")],
    }),
    defineField({
      name: "links",
      title: "Links (optional)",
      description: "Buttons shown under the answer.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "botLink",
          fields: [
            defineField({ name: "label", title: "Button words", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "url",
              title: "Where it goes",
              description: "A page on the site, like /contact, or a full web address like https://example.com",
              type: "string",
              validation: (rule) => rule.required().custom(validLink),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Name", name: "titleAsc", by: [{ field: "title", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "answer.0" },
  },
});
