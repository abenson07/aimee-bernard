// Aimee's four outreach programs, from her Outreach audit (text and links as she gave them).
// The "Ask me a Q?" bot reads this; the Outreach page keeps its own copy for now.
export type OutreachProgram = {
  id: string;
  tag: string;
  title: string;
  words: string[];
  text: string;
  links: { label: string; href: string }[];
};

export const PROGRAMS: OutreachProgram[] = [
  {
    id: "tlas",
    tag: "TLaS",
    title: "Think Like a Scientist",
    words: ["tlas", "think like a scientist"],
    text: "Think Like a Scientist (TLaS) is a free after-school science program where CU Anschutz volunteer scientists and students lead elementary students through hands-on experiments that show science is fun and that anyone can be a scientist.",
    links: [
      { label: "Website", href: "https://tlasprogram.wordpress.com/" },
      { label: "YouTube: Science at Home", href: "https://www.youtube.com/@tlasthinklikeascientist2621/featured" },
      { label: "Curriculum on MERLOT", href: "https://www.merlot.org/merlot/viewMaterial.htm?id=773470786" },
      { label: "Article: Making science cool and fun", href: "https://news.cuanschutz.edu/news-stories/making-science-cool-and-fun" },
      { label: "Article: Increasing Elementary Schooler’s Access to Science", href: "https://news.cuanschutz.edu/medicine/increasing-access-to-science" },
      { label: "Article: Science Communicators Strategize How to Demystify Science", href: "https://news.cuanschutz.edu/news-stories/science-communicators-strategize-how-to-demystify-science" },
    ],
  },
  {
    id: "reach",
    tag: "REACH",
    title: "Raising Environmental Awareness for Community Health",
    words: ["reach", "environment", "environmental", "climate", "pollution"],
    text: "Raising Environmental Awareness for Community Health (REACH) is a five-week program for elementary and middle school students that explores how the environment affects human health, from air pollution to climate change, aimed at inspiring the next generation to be the change needed to protect the Earth.",
    links: [
      { label: "YouTube: Solar Oven Pizza Box", href: "https://www.youtube.com/watch?v=MQywKKl7aRk&list=PLgEJUjPvTME_6vaaeFvpLzVHsYGP4MT-7&index=18&t=1s" },
      { label: "Curriculum on MERLOT", href: "https://www.merlot.org/merlot/viewMaterial.htm?id=773469511" },
    ],
  },
  {
    id: "echo",
    tag: "ECHO",
    title: "Exploring Careers in Healthcare and Onward",
    words: ["echo", "careers", "healthcare careers"],
    text: "Exploring Careers in Healthcare and Onward (ECHO) is a career exploration program that introduces elementary and middle school students to the human body and to healthcare professions through interactive, hands-on activities, aimed at inspiring the next generation into a career in healthcare.",
    links: [
      { label: "YouTube playlist", href: "https://www.youtube.com/playlist?list=PLnQGYTnpUcVfL_My4bjWZox2kaQX3utfq" },
      { label: "YouTube: The Lungs. Build a Model of the Lungs", href: "https://www.youtube.com/watch?v=JeCcHll-LO4" },
      { label: "YouTube: The Heart. Build Your Own Stethoscope", href: "https://www.youtube.com/watch?v=19ZUjebrKcE" },
      { label: "YouTube: Surgery. Make Your Own Surgeon’s Knot Bracelet", href: "https://www.youtube.com/watch?v=svvj-4E66Yk" },
      { label: "YouTube: The Brain. Learn All About Reflexes", href: "https://www.youtube.com/watch?v=PHuxzpYRYhE" },
      { label: "Curriculum on MERLOT", href: "https://www.merlot.org/merlot/viewMaterial.htm?id=773475218" },
      { label: "Article: From ice rinks to clinics, Ariel Davydov finds her path in medicine and education", href: "https://news.cuanschutz.edu/campus-community/from-ice-rinks-to-clinics-ariel-davydov-finds-her-path-in-medicine-and-education" },
    ],
  },
  {
    id: "start",
    tag: "START",
    title: "Students and Teachers Achieving Cancer Research Experiences Together",
    words: ["cancer research education", "start program", "summer camp", "camps"],
    text: "Students and Teachers Achieving Cancer Research Experiences Together (START) is a cancer research education program that offers summer science camps and mentored lab experiences for local students, along with research experiences for high school teachers and events that engage families and the community.",
    links: [
      { label: "Website", href: "https://medschool.cuanschutz.edu/colorado-cancer-center/education/k-12-training-education-opportunities/start-program" },
      { label: "Article: Start to learn about cancer research", href: "https://news.cuanschutz.edu/cancer-center/start-to-learn-about-cancer-research" },
      { label: "Core Concepts in Cancer Biology curriculum on MERLOT", href: "https://www.merlot.org/merlot/viewMaterial.htm?id=824239760" },
    ],
  },
];
