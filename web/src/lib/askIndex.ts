// Builds the knowledge index the "Ask me a Q?" bot searches: Work items, the course topics,
// the outreach programs. Read on request (see pages/api/ask-index.json.ts); if Sanity can't be
// reached, the saved Work snapshot stands in so the bot still answers.
import { sanityClient } from "sanity:client";
import snapshot from "@/data/work-snapshot.json";
import { PROGRAMS } from "@/data/outreach-programs";
import { FACTS, SOCIALS } from "@/data/aimee-facts";
import { yearOf } from "@/utils/sanity";

export type AskRecord = {
  id: string;
  /** talk, podcast, article, press-mentions, award, course, research-publication, educational-content, position, social, topic */
  type: string;
  title: string;
  venue: string | null;
  date: string | null;
  year: number;
  desc: string | null;
  href: string | null;
  featured: boolean;
  /** Persona category name (Educator, Science Communicator, Community Outreach), when set. */
  persona: string | null;
  /** For course topics: the course and group the topic belongs to. */
  parent: string | null;
};

const WORK_QUERY = `*[_type == "contentItem" && defined(kind)]{
  _id, title, kind, venue, date, description,
  "href": coalesce(url, links[0].url, file.asset->url),
  "category": category->name,
  "featured": coalesce(featuredInSearch, false)
}`;

const COURSE_QUERY = `*[_type == "courseGroup"] | order(order asc){
  name,
  years[]{ label, courses[]->{ _id, title, topics } }
}`;

type WorkRow = { _id: string; title: string | null; kind: string; venue: string | null; date: string | null; description?: string | null; href: string | null; category: string | null; featured: boolean };

function fromWork(r: WorkRow): AskRecord {
  return {
    id: r._id,
    type: r.kind,
    title: r.title ?? "",
    venue: r.venue ?? null,
    date: r.date ?? null,
    year: yearOf(r.date),
    desc: r.description ?? null,
    href: r.href ?? null,
    featured: !!r.featured,
    persona: r.category ?? null,
    parent: null,
  };
}

async function readWork(): Promise<AskRecord[]> {
  try {
    const rows: WorkRow[] = await sanityClient.fetch(WORK_QUERY);
    if (rows.length) return rows.map(fromWork);
  } catch (err) {
    console.warn("Ask index: Sanity read failed, using the saved snapshot.", err);
  }
  return (snapshot as any[])
    .filter((r) => r.kind)
    .map((r) => fromWork({ _id: r._id, title: r.title, kind: r.kind, venue: r.venue, date: r.date, description: null, href: r.url ?? r.fileUrl ?? null, category: r.category, featured: false }));
}

async function readTopics(): Promise<AskRecord[]> {
  try {
    const groups: { name: string; years: { label: string; courses: { _id: string; title: string; topics: string[] | null }[] }[] | null }[] = await sanityClient.fetch(COURSE_QUERY);
    const out: AskRecord[] = [];
    for (const g of groups) {
      for (const y of g.years ?? []) {
        for (const c of y.courses ?? []) {
          let heading: string | null = null;
          for (const [i, t] of (c.topics ?? []).entries()) {
            if (t.startsWith("# ")) { heading = t.slice(2); continue; }
            out.push({
              id: `${c._id}-t${i}`,
              type: "topic",
              title: t,
              venue: [g.name, y.label].filter(Boolean).join(" · "),
              date: null,
              year: 0,
              desc: [c.title, heading].filter(Boolean).join(" · "),
              href: "/educator",
              featured: false,
              persona: "Educator",
              parent: c.title,
            });
          }
        }
      }
    }
    return out;
  } catch (err) {
    console.warn("Ask index: course topics unavailable.", err);
    return [];
  }
}

export async function buildAskIndex() {
  const [work, topics] = await Promise.all([readWork(), readTopics()]);
  return { records: [...work, ...topics], programs: PROGRAMS, facts: FACTS, socials: SOCIALS, generatedAt: new Date().toISOString() };
}
