/**
 * The editable parts ("slots") of each designed page, and today's content for each.
 * The seed script writes these into Sanity; the pages in web/src/pages/ use the same keys and keep
 * the same values as built-in fallbacks. Keep the two in step when a slot is added.
 *
 * kind: "text" = a headline or short line, "longtext" = a paragraph, "image" = a photo.
 * file: the photo file under web/public/site/photos/ that is on the page today.
 * pos:  where the photo is focused today, as [x%, y%] (becomes the focus point in the editor).
 */
export type Slot =
  | { key: string; label: string; kind: "text" | "longtext"; text: string }
  | { key: string; label: string; kind: "image"; file: string; pos: [number, number]; alt: string };

export const PAGES: { id: string; title: string; slots: Slot[] }[] = [
  {
    id: "site-page-home",
    title: "Home",
    slots: [
      { key: "hover-educator-photo", label: "Portrait hover: Educator photo", kind: "image", file: "edu-thc-antibody-2400.webp", pos: [50, 45], alt: "Aimee presenting to an audience, a slide about B cells and antibodies behind her" },
      { key: "hover-educator-text", label: "Portrait hover: Educator speech bubble", kind: "longtext", text: "Class is in session! Aimee’s been teaching since 2007!" },
      { key: "hover-immunologist-photo", label: "Portrait hover: Immunologist photo", kind: "image", file: "immu-lab-tubes-2400.webp", pos: [60, 40], alt: "Aimee in a lab coat holding a sample tube" },
      { key: "hover-immunologist-text", label: "Portrait hover: Immunologist speech bubble", kind: "longtext", text: "Meet a published immunologist! Aimee studied B cell development and autoimmunity for her PhD" },
      { key: "hover-communicator-photo", label: "Portrait hover: Communicator photo", kind: "image", file: "tedx-scientist-2400.webp", pos: [50, 64], alt: "Aimee on stage at TEDxCU" },
      { key: "hover-communicator-text", label: "Portrait hover: Communicator speech bubble", kind: "longtext", text: "Aimee is passionate about making all science, especially immunology, accessible for everyone!" },
      { key: "working-heading", label: "“What Aimee’s Working On” heading", kind: "text", text: "What Aimee's Working On" },
      { key: "working-1-photo", label: "Working on, card 1: photo", kind: "image", file: "tlas-ask-a-q-1148.webp", pos: [50, 40], alt: "" },
      { key: "working-1-name", label: "Working on, card 1: title", kind: "text", text: "Think Like a Scientist" },
      { key: "working-1-sub", label: "Working on, card 1: line under the title", kind: "text", text: "Science outreach program" },
      { key: "working-2-photo", label: "Working on, card 2: photo", kind: "image", file: "funsize-ig-collage-1600.webp", pos: [50, 50], alt: "" },
      { key: "working-2-name", label: "Working on, card 2: title", kind: "text", text: "Fun Size Immuninja" },
      { key: "working-2-sub", label: "Working on, card 2: line under the title", kind: "text", text: "Immunology on Instagram" },
      { key: "working-3-photo", label: "Working on, card 3: photo", kind: "image", file: "ttp-teaching-1600.webp", pos: [76, 50], alt: "" },
      { key: "working-3-name", label: "Working on, card 3: title", kind: "text", text: "Teacher Training Program" },
      { key: "working-3-sub", label: "Working on, card 3: line under the title", kind: "text", text: "Mentoring PhD students and postdocs" },
      { key: "working-4-photo", label: "Working on, card 4: photo", kind: "image", file: "substack-collage-1600.webp", pos: [50, 50], alt: "" },
      { key: "working-4-name", label: "Working on, card 4: title", kind: "text", text: "Science Crosstalk" },
      { key: "working-4-sub", label: "Working on, card 4: line under the title", kind: "text", text: "Where Science and Communication Collide" },
    ],
  },
  {
    id: "site-page-educator",
    title: "Educator",
    slots: [
      { key: "hero-title", label: "Top heading", kind: "text", text: "Teaching immunology so it sticks" },
      { key: "hero-blurb", label: "Top paragraph (right of the heading)", kind: "longtext", text: "Since 2007, Aimee has taught 30+ courses, from first-year medical students and PhD trainees to faculty and community members." },
      { key: "hero-photo", label: "Top photo (large, left)", kind: "image", file: "edu-thc-antibody-1600.webp", pos: [50, 40], alt: "Aimee presenting to an audience, a slide about B cells and antibodies behind her" },
      { key: "programs-heading", label: "“Building the next generation” heading", kind: "text", text: "Building the next generation of teachers" },
      { key: "program-1-photo", label: "Program card 1: photo", kind: "image", file: "ttp-aimee-1600.webp", pos: [50, 50], alt: "Aimee presenting the Teacher Training Program" },
      { key: "program-1-name", label: "Program card 1: title", kind: "text", text: "Teacher Training Program" },
      { key: "program-1-sub", label: "Program card 1: line under the title", kind: "text", text: "2018–present" },
      { key: "program-2-photo", label: "Program card 2: photo", kind: "image", file: "cctsi-slide-swapped-nologo-1600.webp", pos: [0, 50], alt: "Communicating Your Science to the Public workshop series, Session 1, with Aimee Pugh Bernard and Wendy S. Meyer" },
      { key: "program-2-name", label: "Program card 2: title", kind: "text", text: "Communicating Your Science to the Public" },
      { key: "program-2-sub", label: "Program card 2: line under the title", kind: "text", text: "2023–present" },
    ],
  },
];
