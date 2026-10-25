/* The B cell's words. Everything here is hand-written from Aimee's own documents and the site's existing
   cartoon lines; the facts and links a reply shows come from the content index, not from this file. */

export const NAME = 'B cell';

export const GREETING = [
  'Hi! I’m a B cell. I make antibodies.',
  'Ask me about Aimee: her talks, podcasts, writing, awards, teaching or outreach.',
];

export const STARTERS = [
  { label: 'What does Aimee do?', say: 'what does aimee do' },
  { label: 'Podcasts', say: 'podcasts' },
  { label: 'Talks', say: 'talks' },
  { label: 'Awards', say: 'awards' },
  { label: 'Outreach for kids', say: 'outreach' },
  { label: 'Book Aimee', say: 'book aimee' },
];

export const HELP = [
  'I can find Aimee’s talks, podcasts, press, writing, papers, awards and the courses she teaches.',
  'Try “podcasts”, “talks 2024”, “vaccines” or “NPR”.',
];

export const FALLBACK = [
  'I don’t know that one!',
  'Try a word like “podcasts” or “vaccines”, pick one below, or send Aimee a note.',
];

export const THANKS = ['Anytime! Antibodies love to help.', 'You’re welcome! Want to look at something else?'];

export const SAFETY = [
  'I’m a B cell, not a doctor! For health questions, please talk with your own healthcare provider.',
  'I can point you to Aimee’s educational videos and articles about how the immune system works.',
];

/* The three hats on the Home page, plus the immunologist. */
export const HATS_LEAD = 'Aimee wears a few hats! Which one are you curious about?';
export const PERSONAS = [
  {
    id: 'educator',
    category: 'Educator',
    label: 'Educator',
    words: ['educator', 'teacher'],
    blurb: 'Aimee has taught 30+ courses since 2007, from first-year medical students and PhD trainees to faculty and community members.',
    page: '/educator',
    chips: [{ label: 'Courses she teaches', say: 'courses' }, { label: 'Teaching awards', say: 'awards' }, { label: 'Educational videos', say: 'educational videos' }],
  },
  {
    id: 'communicator',
    category: 'Science Communicator',
    label: 'Science Communicator',
    words: ['communicator', 'sci comm', 'scicomm'],
    blurb: 'Aimee is passionate about making all science, especially immunology, accessible for everyone! Talks, keynotes and workshops make science clear, honest and authentic.',
    page: '/communicator',
    chips: [{ label: 'Talks', say: 'talks' }, { label: 'Podcasts', say: 'podcasts' }, { label: 'Writing', say: 'articles' }, { label: 'In the press', say: 'press' }],
  },
  {
    id: 'immunologist',
    category: null,
    label: 'Immunologist',
    words: ['immunologist', 'researcher', 'scientist'],
    blurb: 'Meet a published immunologist! Aimee studied B cell development and autoimmunity for her PhD.',
    page: '/immunology',
    chips: [{ label: 'Her papers', say: 'papers' }, { label: 'Positions she has held', say: 'positions' }],
  },
  {
    id: 'outreach',
    category: 'Community Outreach',
    label: 'Community Outreach',
    words: ['outreach'],
    blurb: 'Aimee has helped build programs that bring hands-on science to students from elementary school through high school, and to the teachers and families who support them.',
    page: '/community-outreach',
    chips: [],
  },
];

export const BOOKING = [
  'Aimee gives talks, keynotes and workshops to make science clear, honest and authentic.',
  'The best way to book her is a note on the contact page.',
];

export const BOOKING_CARD = { title: 'Contact Aimee', meta: 'Talks, workshops, collaborations', desc: 'Have a talk, workshop, or collaboration in mind? Send a note.', href: '/contact' };

export const PROGRAMS_LEAD = [
  'Aimee has helped build four outreach programs that bring hands-on science to students and teachers.',
  'Each is built on the belief that anyone can become a scientist.',
];

/* One-liners about the cells, taken from the header cartoons' own lines. */
export const EXPLAINERS = [
  { words: ['b cell', 'bcell', 'b-cell'], lines: ['That’s me! I make antibodies.', 'B cells mature in the bone marrow, and each of us recognizes one specific antigen. Some of us turn into memory cells and stick around for years.'] },
  { words: ['dendritic'], lines: ['Dendritic cells capture germs to sound the alarm.', 'They patrol the body looking for invading pathogens, chop germs to bits and show them off to their friends.'] },
  { words: ['macrophage'], lines: ['Macrophage means “big eater”.', 'They’re phagocytic cells: they eat germs for a living.'] },
  { words: ['t cell', 'tcell', 't-cell'], lines: ['T cells patrol for infected cells.', 'They mature in the thymus, and each T cell recognizes one specific antigen.'] },
  { words: ['antibod'], lines: ['Antibodies are Y-shaped, and B cells make them.', 'Each tip grabs one exact target, and they tag germs so other cells know what to eat.'] },
  { words: ['neutrophil'], lines: ['Neutrophils are usually first on the scene.', 'They’re the most common white blood cell in your body, and they eat bacteria whole.'] },
  { words: ['vaccine', 'vaccin'], lines: ['A vaccine is a practice round.', 'It shows your immune system a harmless preview of a germ, so your memory cells are ready for the real thing.'] },
  { words: ['interferon'], lines: ['Interferon is a warning signal between cells.', 'It tells nearby cells: “Virus around, lock it down!”'] },
];

/* A fun line when the search was about one of these topics. Same source as above. */
export const TOPIC_FACTS = {
  vaccin: 'A vaccine is a practice round: a harmless preview of a germ, so your memory cells are ready for the real thing.',
  antibod: 'Antibodies are Y-shaped, and each tip grabs one exact target.',
  autoimmun: 'Autoimmunity is when the immune system mistakes parts of the body for invaders.',
  cancer: 'Immunotherapy teaches the immune system to find and fight cancer cells.',
  tedx: 'Aimee’s TEDxCU talk is about why science education needs communication training.',
};

/* Lead lines for a set of results. {n} is the count in words, {k} the kind (plural). */
export const LEADS = {
  podcast: ['{N} podcasts, newest first. Antibodies and podcasts: both about getting the word out!', 'Aimee has been on {n} podcasts. Here they are:'],
  talk: ['Aimee loves a good talk! Here are {n}:', '{N} talks I can show you:'],
  article: ['Here is some of Aimee’s writing:', '{N} pieces of writing for you:'],
  'press-mentions': ['Aimee in the press! {N} to look at:', 'Here’s where Aimee has been in the news:'],
  award: ['Aimee has won {n} awards. Here they are:', '{N} awards, newest first:'],
  'research-publication': ['Aimee’s research papers:', '{N} papers I found:'],
  'educational-content': ['Here are some of Aimee’s educational videos and resources:', '{N} things to learn from:'],
  course: ['Here’s what Aimee teaches:', '{N} courses and topics:'],
  topic: ['Here’s what Aimee teaches:', '{N} course topics:'],
  position: ['Positions Aimee has held:', '{N} roles I found:'],
  social: ['Find Aimee here:', '{N} places to follow her:'],
  any: ['Here’s what I found:', '{N} things I found:'],
};
export const KIND_PLURAL = {
  podcast: 'podcasts', talk: 'talks', article: 'articles', 'press-mentions': 'press mentions', award: 'awards',
  'research-publication': 'papers', 'educational-content': 'educational resources', course: 'courses', topic: 'course topics', position: 'positions', social: 'accounts',
};
export const KIND_LABEL = {
  podcast: 'Podcast', talk: 'Talk', article: 'Article', 'press-mentions': 'Press', award: 'Award',
  'research-publication': 'Paper', 'educational-content': 'Educational', course: 'Course', topic: 'Course topic', position: 'Position', social: 'Social',
};

/* Words that mean a kind of content. Matched after light stemming (see the engine). */
export const KIND_WORDS = {
  talk: ['talk', 'speak', 'spoke', 'speaking', 'keynote', 'lecture', 'presentation', 'webinar', 'seminar', 'grand rounds'],
  podcast: ['podcast', 'episode', 'interviewed'],
  'press-mentions': ['press', 'news', 'media', 'quoted', 'interview', 'newspaper'],
  article: ['article', 'write', 'writing', 'wrote', 'blog', 'essay', 'editorial', 'substack', 'column'],
  'research-publication': ['paper', 'publication', 'published', 'journal', 'research paper', 'study', 'studies'],
  award: ['award', 'honor', 'honour', 'prize', 'recognition', 'won', 'win'],
  course: ['course', 'class', 'curriculum', 'teach', 'taught', 'teaching', 'syllabus'],
  'educational-content': ['video', 'educational', 'resource', 'explainer'],
  position: ['position', 'role', 'job', 'appointment', 'worked'],
  social: ['instagram', 'tiktok', 'bluesky', 'social'],
};

/* Words that mean the same thing when matching topics. */
export const SYNONYMS = [
  ['radio', 'npr', 'siriusxm', 'sirius', 'koa', 'doctor radio'],
  ['vaccine', 'vaccin', 'immunization', 'immunisation', 'shot', 'booster'],
  ['covid', 'covid-19', 'coronavirus', 'sars-cov-2', 'pandemic'],
  ['cancer', 'oncology', 'tumor', 'tumour', 'immunotherapy'],
  ['kid', 'child', 'children', 'elementary'],
  ['autoimmune', 'autoimmunity', 'autoimmun'],
  ['communicat', 'communication', 'communicating', 'sci comm', 'scicomm'],
  ['medical school', 'med school', 'school of medicine', 'medical student'],
  ['grad', 'graduate', 'phd', 'doctoral'],
  ['tooth', 'teeth', 'dental', 'dentist'],
  ['tedx', 'tedxcu', 'ted'],
];
