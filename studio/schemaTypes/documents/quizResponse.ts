import { ClipboardIcon } from "@sanity/icons/Clipboard";
import { defineField, defineType } from "sanity";

export const quizResponse = defineType({
  name: "quizResponse",
  title: "Quiz Response",
  type: "document",
  icon: ClipboardIcon,
  // No custom desk structure exists in this Studio, so `hidden` is the only
  // way to keep this out of the nav — it's written and read by the dashboard
  // app only and was never meant to be seen or edited here.
  hidden: () => true,
  fields: [
    defineField({
      name: "answers",
      title: "Answers",
      description:
        "JSON-stringified array of { key, question, type, answer }. Written by the dashboard app only.",
      type: "text",
      readOnly: true,
    }),
    defineField({
      name: "completedAt",
      title: "Completed at",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { completedAt: "completedAt" },
    prepare: ({ completedAt }) => ({
      title: "Voice & Tone Questionnaire",
      subtitle: completedAt ? `Completed ${completedAt}` : "In progress",
    }),
  },
});
