import { TagIcon } from "@sanity/icons/Tag";
import { defineArrayMember, defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "definition",
      title: "Definition",
      description: "The current working definition of what belongs in this category.",
      type: "text",
    }),
    defineField({
      name: "refinementQA",
      title: "Refinement Q&A",
      description:
        "Questions used to sharpen the definition above. An empty answer means the question is still pending in the dashboard.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "qaEntry",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "questionType",
              title: "Question type",
              type: "string",
              initialValue: "open",
              options: {
                list: [
                  { title: "Open-ended", value: "open" },
                  { title: "Multiple choice", value: "choice" },
                ],
                layout: "radio",
              },
            }),
            defineField({
              name: "options",
              title: "Options",
              description: "The choices offered. Only used for multiple-choice questions.",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              hidden: ({ parent }) => parent?.questionType !== "choice",
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
            }),
            defineField({
              name: "answeredAt",
              title: "Answered at",
              type: "datetime",
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
