export const QUESTIONNAIRE_DOC_ID = "voiceToneQuestionnaire";

export const SECTIONS = [
  { id: 1, title: "Foundation" },
  { id: 2, title: "Personality" },
  { id: 3, title: "Tone dials" },
  { id: 4, title: "Mechanics" },
  { id: 5, title: "Language" },
  { id: 6, title: "Calibration" },
  { id: 7, title: "Your own work" },
  { id: 8, title: "Red lines" },
  { id: 9, title: "Anything else" },
] as const;

interface QuestionBase {
  key: string;
  prompt: string;
  helpText?: string;
}

export type TextQuestion = QuestionBase & { type: "text"; tall?: boolean };

export type ChoiceQuestion = QuestionBase & {
  type: "choice";
  options: string[];
  allowOther?: boolean;
  otherLabel?: string;
};

export type ChoiceLongOption = { value: string; text: string };

export type ChoiceWithNoteQuestion = QuestionBase & {
  type: "choice_with_note";
  options: ChoiceLongOption[];
  notePrompt?: string;
};

export type MultiChoiceQuestion = QuestionBase & {
  type: "multi_choice";
  options: string[];
  max?: number;
  allowOther?: boolean;
  otherLabel?: string;
};

export type ScaleQuestion = QuestionBase & {
  type: "scale";
  leftLabel: string;
  rightLabel: string;
};

/* Search-and-link-existing-content, with an escape hatch to add something new.
   Rendered by ContentLinkControl, which needs live data (uploaded content,
   categories) that doesn't belong in this static config. */
export type ContentLinkQuestion = QuestionBase & { type: "content_link" };

export type Question =
  | TextQuestion
  | ChoiceQuestion
  | ChoiceWithNoteQuestion
  | MultiChoiceQuestion
  | ScaleQuestion
  | ContentLinkQuestion;

export interface StoredAnswer {
  key: string;
  question: string;
  type: Question["type"];
  answer: string | string[];
}

export interface Page {
  key: string;
  section: number;
  title?: string;
  fields: Question[];
}

export const PAGES: Page[] = [
  // Section 1 — Foundation
  {
    key: "1.1",
    section: 1,
    fields: [
      {
        key: "1.1",
        type: "text",
        prompt:
          'Finish this sentence in one line, as you\'d say it out loud to a stranger at a party: "I\'m a scientist who..."',
      },
    ],
  },
  {
    key: "1.2",
    section: 1,
    fields: [
      {
        key: "1.2",
        type: "text",
        prompt:
          "Someone lands on your homepage, reads for 20 seconds, and leaves. What one thing do you want them to remember?",
      },
    ],
  },
  {
    key: "1.3",
    section: 1,
    fields: [
      {
        key: "1.3",
        type: "multi_choice",
        prompt: "What should they feel? Pick up to three.",
        max: 3,
        allowOther: true,
        options: [
          "impressed",
          "curious",
          "reassured",
          "energized",
          "welcomed",
          "challenged",
          "inspired",
          "at ease",
        ],
      },
    ],
  },
  {
    key: "1.4",
    section: 1,
    fields: [
      {
        key: "1.4",
        type: "text",
        tall: true,
        prompt: "What's the single biggest misconception about you that this site needs to correct?",
      },
    ],
  },

  // Section 2 — Personality
  {
    key: "2.1",
    section: 2,
    fields: [
      {
        key: "2.1",
        type: "multi_choice",
        prompt: "Pick the five adjectives that best describe how you want to come across in writing.",
        max: 5,
        allowOther: true,
        options: [
          "warm",
          "rigorous",
          "funny",
          "direct",
          "approachable",
          "authoritative",
          "curious",
          "irreverent",
          "generous",
          "precise",
          "passionate",
          "calm",
          "bold",
          "humble",
          "playful",
          "no-nonsense",
        ],
      },
    ],
  },
  {
    key: "2.2",
    section: 2,
    fields: [
      {
        key: "2.2",
        type: "multi_choice",
        prompt: "Now the opposite — pick three you never want to be called.",
        max: 3,
        allowOther: true,
        options: [
          "stuffy",
          "preachy",
          "cutesy",
          "cold",
          "salesy",
          "academic",
          "vague",
          "condescending",
          "try-hard",
          "corporate",
          "alarmist",
          "dry",
        ],
      },
    ],
  },
  {
    key: "2.4-2.5",
    section: 2,
    fields: [
      {
        key: "2.4",
        type: "text",
        prompt:
          "Name one person, writer, account, or site whose voice you'd be happy to be compared to. What specifically about it works?",
      },
      {
        key: "2.5",
        type: "text",
        prompt: "Name one you'd hate to be compared to, and why.",
      },
    ],
  },

  // Section 3 — Tone dials (all on one page)
  {
    key: "3.dials",
    section: 3,
    title: "Rank where your voice should land.",
    fields: [
      {
        key: "3.formal_casual",
        type: "scale",
        prompt: "Formal — Casual",
        leftLabel: "Formal",
        rightLabel: "Casual",
      },
      {
        key: "3.serious_playful",
        type: "scale",
        prompt: "Serious — Playful",
        leftLabel: "Serious",
        rightLabel: "Playful",
      },
      {
        key: "3.expert_peer",
        type: "scale",
        prompt: "Expert speaking down — Peer speaking across",
        leftLabel: "Expert speaking down",
        rightLabel: "Peer speaking across",
      },
      {
        key: "3.measured_enthusiastic",
        type: "scale",
        prompt: "Measured — Enthusiastic",
        leftLabel: "Measured",
        rightLabel: "Enthusiastic",
      },
      {
        key: "3.concise_expansive",
        type: "scale",
        prompt: "Concise — Expansive",
        leftLabel: "Concise",
        rightLabel: "Expansive",
      },
      {
        key: "3.reserved_personal",
        type: "scale",
        prompt: "Reserved about yourself — Openly personal",
        leftLabel: "Reserved about yourself",
        rightLabel: "Openly personal",
      },
      {
        key: "3.neutral_opinionated",
        type: "scale",
        prompt: "Neutral — Opinionated",
        leftLabel: "Neutral",
        rightLabel: "Opinionated",
      },
      {
        key: "3.1",
        type: "text",
        prompt:
          "Which of those dials matters most to get right? Which would bother you most if we got it wrong?",
      },
    ],
  },

  // Section 4 — Mechanics
  {
    key: "4.name",
    section: 4,
    fields: [
      {
        key: "4.name",
        type: "choice",
        prompt: "Name on the site",
        options: ["Dr. Bernard", "Dr. Aimee Pugh Bernard", "Aimee Pugh Bernard", "Aimee"],
      },
    ],
  },
  {
    key: "4.humor",
    section: 4,
    fields: [
      {
        key: "4.humor",
        type: "choice_with_note",
        prompt:
          "Here are five ways to bring humor (or not) into the same explanation. Which one sounds most like you?",
        notePrompt: "What's off about it?",
        options: [
          {
            value: "A",
            text: "T cells and B cells work together to identify and eliminate specific pathogens, a process that can take several days to fully mount.",
          },
          {
            value: "B",
            text: "T cells and B cells work together to identify and eliminate specific pathogens. That response takes days to fully mobilize — which is exactly why the earliest days of an infection matter most, and why vaccines exist to give the immune system a head start.",
          },
          {
            value: "C",
            text: "T cells and B cells work together to identify and eliminate specific pathogens — a process that takes a few days, which is why you still feel awful even after your body's already on the case.",
          },
          {
            value: "D",
            text: "Think of T cells and B cells as your immune system's search-and-destroy unit — thorough, a little slow to get moving, but merciless once they lock onto a target.",
          },
          {
            value: "E",
            text: "T cells and B cells are basically your immune system's most extra employees: they take a few days to get organized, hold a full briefing, and then absolutely will not let a pathogen leave the building.",
          },
        ],
      },
    ],
  },

  // Section 5 — Language
  {
    key: "5.1",
    section: 5,
    fields: [
      {
        key: "5.1",
        type: "text",
        prompt: "Words, phrases, or metaphors you use often and want kept.",
      },
    ],
  },
  {
    key: "5.2",
    section: 5,
    fields: [
      {
        key: "5.2",
        type: "text",
        tall: true,
        prompt:
          "Words or phrases you never want on this site. Be specific and petty — this list is more useful the more specific it is.",
        helpText:
          'Things like "thought leader," "passionate about," "journey," "unpack," "at the end of the day," "leverage."',
      },
    ],
  },
  {
    key: "5.3",
    section: 5,
    fields: [
      {
        key: "5.3",
        type: "multi_choice",
        prompt: "Which personas can carry more immunology jargon?",
        helpText: "Pick any that apply. Anything not picked defaults to plain language.",
        options: ["Immunologist", "Educator", "Science Communicator", "Community Outreach"],
      },
    ],
  },
  {
    key: "5.4",
    section: 5,
    fields: [
      {
        key: "5.4",
        type: "choice",
        prompt: "How do you refer to non-scientists?",
        options: ["the public", "general audiences", "everyone else", "non-scientists"],
        allowOther: true,
        otherLabel: "something else",
      },
    ],
  },
  {
    key: "5.5",
    section: 5,
    fields: [
      {
        key: "5.5",
        type: "text",
        prompt: "Is there terminology in your field you actively dislike or find misleading?",
      },
    ],
  },

  // Section 6 — Calibration
  {
    key: "6.1",
    section: 6,
    fields: [
      {
        key: "6.1",
        type: "choice_with_note",
        prompt: "Here are four different ways your site's bio could open. Which one sounds most like you?",
        notePrompt: "What's off about it?",
        options: [
          {
            value: "A",
            text: "Dr. Aimee Pugh Bernard is an immunologist and educator at the University of Colorado Anschutz Medical Campus, where her work spans medical education, science communication, and community outreach.",
          },
          {
            value: "B",
            text: "I'm an immunologist who left the bench in 2007 to teach — and I've spent every year since figuring out how to get immunology out of the lab and into the world.",
          },
          {
            value: "C",
            text: "I teach immunology. I also write about it, talk about it, make videos about it, and drag it into elementary school classrooms whenever I can.",
          },
          {
            value: "D",
            text: "The immune system is the most fascinating thing I know, and my job — across teaching, writing, and outreach — is making sure you think so too.",
          },
        ],
      },
    ],
  },
  {
    key: "6.2",
    section: 6,
    fields: [
      {
        key: "6.2",
        type: "choice_with_note",
        prompt:
          "Here are three ways to describe your Think Like a Scientist outreach work. Which one sounds most like you?",
        notePrompt: "What's off about it?",
        options: [
          {
            value: "A",
            text: "Think Like a Scientist is a K–12 outreach program designed to build scientific literacy through hands-on inquiry.",
          },
          {
            value: "B",
            text: "Think Like a Scientist puts real experiments in front of kids who don't often get them, and lets them find out they're already good at this.",
          },
          {
            value: "C",
            text: "I started Think Like a Scientist because I got tired of science stopping at the campus gates.",
          },
        ],
      },
    ],
  },
  {
    key: "6.3",
    section: 6,
    fields: [
      {
        key: "6.3",
        type: "choice_with_note",
        prompt:
          "Here are three ways to phrase a call to action for speaking inquiries. Which one sounds most like you?",
        notePrompt: "What's off about it?",
        options: [
          { value: "A", text: "For speaking inquiries, please get in touch." },
          { value: "B", text: "Want me to come talk to your group? Let's find a date." },
          {
            value: "C",
            text: "I'd love to talk with your audience. Reach out and let's figure out what would be most useful.",
          },
        ],
      },
    ],
  },

  // Section 7 — Your own work
  {
    key: "7.1",
    section: 7,
    fields: [
      {
        key: "7.1",
        type: "content_link",
        prompt:
          "Point us to one thing you've written or recorded that sounds most like you — the voice we should be reverse-engineering. Search what's already uploaded, or add something new.",
      },
    ],
  },
  {
    key: "7.2",
    section: 7,
    fields: [
      {
        key: "7.2",
        type: "text",
        prompt: "Anything you've published that you'd now write differently? What would you change?",
      },
    ],
  },

  // Section 8 — Red lines
  {
    key: "8.1",
    section: 8,
    fields: [
      {
        key: "8.1",
        type: "text",
        prompt: "What would make you cringe if you saw it on your own site?",
      },
    ],
  },
  {
    key: "8.2",
    section: 8,
    fields: [
      {
        key: "8.2",
        type: "text",
        prompt:
          "Is there anything you can't or won't write about — because of your job, your institution, or your own personal boundaries? What is it?",
      },
    ],
  },

  // Section 9 — Anything else
  {
    key: "9.1",
    section: 9,
    fields: [
      {
        key: "9.1",
        type: "text",
        prompt: "What did we not ask about that we should have?",
      },
    ],
  },
];

export const FIELDS: Question[] = PAGES.flatMap((page) => page.fields);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateAnswer(question: Question, value: unknown): boolean {
  switch (question.type) {
    case "text":
    case "content_link":
    case "choice":
      return isNonEmptyString(value);
    case "scale":
      return typeof value === "string" && ["1", "2", "3", "4", "5"].includes(value);
    case "choice_with_note":
      return (
        Array.isArray(value) &&
        value.length === 2 &&
        isNonEmptyString(value[0]) &&
        isNonEmptyString(value[1])
      );
    case "multi_choice":
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        (question.max === undefined || value.length <= question.max) &&
        value.every(isNonEmptyString)
      );
    default:
      return false;
  }
}
