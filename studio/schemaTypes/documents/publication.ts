import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      description: "The outlet's name, matching how it should read wherever no logo is shown.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description: "The outlet's wordmark or logo, for display on press cards.",
      type: "image",
    }),
    defineField({
      name: "url",
      title: "URL",
      description: "The outlet's homepage, for linking off the logo.",
      type: "url",
    }),
    defineField({
      name: "stripOrder",
      title: "Logo strip position",
      description:
        "Where this logo sits in the scrolling logo strips on Home and Communicator (1 is first). Leave blank to keep it out of the strips.",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
