// What the "Ask me a Q?" B cell knows about Aimee that isn't an item on the Work page.
// Every line comes from the site or from her own documents; nothing here is guessed.
// The shape matches what an editable Sanity document would hold (see the note in the PR),
// so moving it into Studio later only changes where askIndex.ts reads it from.

/** Aimee uses the same handle on the three social networks. The Substack is her newsletter. */
export const SOCIALS = [
  { id: "instagram", label: "Instagram", handle: "@funsizeimmuninja", href: "https://www.instagram.com/funsizeimmuninja/?hl=en", words: ["instagram", "insta", "ig"] },
  { id: "tiktok", label: "TikTok", handle: "@funsizeimmuninja", href: "https://www.tiktok.com/@funsizeimmuninja", words: ["tiktok", "tik tok"] },
  { id: "bluesky", label: "Bluesky", handle: "@funsizeimmuninja.bsky.social", href: "https://bsky.app/profile/funsizeimmuninja.bsky.social", words: ["bluesky", "bsky"] },
  { id: "substack", label: "Substack", handle: "Science Crosstalk", href: "https://aimeepughbernard.substack.com/", words: ["substack", "newsletter", "science crosstalk", "crosstalk"] },
];

export interface BotFact {
  id: string;
  /** Patterns (lower case, no punctuation) that mean someone is asking this. */
  match: string[];
  answer: string[];
  links?: { label: string; href: string }[];
}

export const FACTS: BotFact[] = [
  {
    id: "teaching-roles",
    match: ["what does she teach", "what classes", "what courses does she (run|direct|lead)", "course director", "who teaches immunology"],
    answer: [
      "Aimee directs MIMS7530 Introduction to Immunology and MIMS6062 Introduction to Science Communication in the CU Graduate School.",
      "She is also the immunology content director for the School of Medicine and for the Physician Assistant program.",
    ],
    links: [{ label: "Her teaching page", href: "/educator" }],
  },
  {
    id: "how-long",
    match: ["how long has she (taught|been teaching)", "since when does she teach", "how many courses"],
    answer: ["Aimee has taught 30+ courses since 2007, from first-year medical students and PhD trainees to faculty and community members."],
    links: [{ label: "Her teaching page", href: "/educator" }],
  },
  {
    id: "phd",
    match: ["what did she study", "her phd", "phd on", "what does she research", "her research", "research focus", "what is her research"],
    answer: ["Aimee studied B cell development and autoimmunity for her PhD. Her papers are on the Immunologist page."],
    links: [{ label: "The Immunologist page", href: "/immunology" }],
  },
  {
    id: "aai",
    match: ["american association of immunologists", "what is aai", "aai role"],
    answer: ["Aimee chairs the Public Outreach Core Committee of the American Association of Immunologists (AAI)."],
  },
  {
    id: "outreach-role",
    match: ["immunize colorado"],
    answer: ["Aimee served on the board of Immunize Colorado from 2018 to 2026."],
  },
  {
    id: "unbiased-science",
    match: ["unbiased science"],
    answer: ["Aimee is the immunology expert for Unbiased Science, and she has been a guest on their podcast."],
  },
  {
    id: "fun-size",
    match: ["fun size", "funsize", "immuninja"],
    answer: ["Fun Size Immuninja is Aimee’s social media handle, where she shares immunology for anyone who is curious."],
  },
  {
    id: "contact",
    match: ["her email", "email address", "phone number", "how do i (contact|reach|email|message) (her|aimee)", "get in touch"],
    answer: ["The best way to reach Aimee is a note on the contact page."],
    links: [{ label: "Contact Aimee", href: "/contact" }],
  },
];
