/**
 * One-time seed: creates the six `courseGroup` documents that drive the course
 * tiles and panels on the Educator page, linking each to the existing `course`
 * items. The text is the copy that was previously written into the page.
 *
 * Safe to re-run: documents use fixed _ids and are replaced.
 *
 * Usage (from studio/):
 *   ../node_modules/.bin/tsx scripts/seed-course-groups.ts --dry-run
 *   ../node_modules/.bin/tsx scripts/seed-course-groups.ts
 *
 * Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_WRITE_TOKEN in the environment.
 */
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Course = { _id: string; title: string; venue: string | null };

/** Finds a course by the start of its title, and optionally by a piece of its venue. */
function pick(all: Course[], titleStart: string, venueHas?: string): Course {
  const hits = all.filter((c) => c.title.startsWith(titleStart) && (!venueHas || c.venue?.includes(venueHas)));
  if (hits.length !== 1) throw new Error(`Expected one course for "${titleStart}" ${venueHas ?? ""}, found ${hits.length}`);
  return hits[0];
}

const link = (c: Course) => ({ _type: "reference", _ref: c._id, _key: c._id });

async function main() {
  const all = await client.fetch<Course[]>(`*[_type == "contentItem" && kind == "course"]{ _id, title, venue }`);
  const c = (t: string, v?: string) => pick(all, t, v);

  const groups = [
    {
      _id: "courseGroup-som",
      name: "CU School of Medicine",
      order: 1,
      icon: "lab-coat",
      tileMeta: ["Immunology", "Content Director. 2020-current", "Years 1-4"],
      pill: "Immunology — Content Director",
      dates: "2020–current · Years 1–4",
      intro: "Immunology content director across Years 1–4 of the CU School of Medicine curriculum.",
      body: "From the first-year organ-system courses (“The Plains”) to the third-year advanced sciences course (“The Alpine Summit”).",
      tags: ["The Plains · Year 1", "The Alpine Summit · Year 3"],
      years: [
        {
          label: "YEAR 1. The ‘Plains’",
          description: "Immunology woven through the organ-system courses of the first year of medical school.",
          courses: ["IDPT5016", "IDPT5017", "IDPT5018", "IDPT5019", "IDPT5021", "IDPT5022", "IDPT5023", "IDPT5025", "IDPT5026"].map((t) => c(t)),
        },
        {
          label: "YEAR 3. The ‘Alpine Summit’",
          description: "Advanced immunology and immunotherapy in the third-year Alpine Summit.",
          courses: [c("IDPT8039")],
        },
      ],
    },
    {
      _id: "courseGroup-cha",
      name: "CU Child Health Advocate / Physician Assistant Program",
      order: 2,
      icon: "stethoscope",
      tileMeta: ["Immunology", "Content Director. 2018-current", "Year 1 and Year 2"],
      pill: "Immunology — Content Director",
      dates: "2018–current · Year 1 and Year 2",
      intro: "Immunology content director for the CU Child Health Advocate / Physician Assistant Program.",
      body: "A summer immersion in immunology and microbiology, then immunology through the academic year in Years 1 and 2.",
      tags: ["Summer Immersion · Year 1", "Academic Year Immunology · Years 1 & 2"],
      years: [
        {
          label: "YEAR 1",
          description: "A summer immersion followed by the immunology academic-year course.",
          courses: [c("Summer Immersion"), c("Academic Year", "Year 1")],
        },
        {
          label: "YEAR 2",
          description: "Immunology in the second year: hypersensitivity, immunodeficiency and rheumatologic inflammation.",
          courses: [c("Academic Year", "Year 2")],
        },
      ],
    },
    {
      _id: "courseGroup-dent",
      name: "CU School of Dental Medicine",
      order: 3,
      icon: "tooth",
      tileMeta: ["Course Director. 2019-2024", "Year 1"],
      pill: "Course Director",
      dates: "2019–2024 · Year 1",
      intro: "Course director for Invaders & Protectors (Microbiology & Immunology).",
      body: "This course covers basic principles of general and medical microbiology with emphasis on oral microorganisms while integrating the response of the immune system to fight these invaders.",
      tags: ["Invaders & Protectors · Year 1"],
      years: [
        {
          label: "YEAR 1. Invaders & Protectors",
          description:
            "This course covers basic principles of general and medical microbiology with emphasis on oral microorganisms while integrating the response of the immune system to fight these invaders.",
          courses: [c("DSBS5511")],
        },
      ],
    },
    {
      _id: "courseGroup-grad",
      name: "CU Graduate School",
      order: 4,
      icon: "microscope",
      tileMeta: ["Course Director. 2021-current", "2026-current"],
      pill: "Course Director",
      dates: "2021–current",
      intro: "Course director for two graduate courses: Introduction to Immunology and Introduction to Science Communication.",
      body: "One builds a foundation in immunology; the other builds the skills to explain science to any audience.",
      tags: ["Introduction to Immunology", "Science Communication"],
      years: [
        {
          label: "Introduction to Immunology",
          description:
            "This course is an introductory immunology course designed to provide students with an introduction to the field of immunology. This class is intended to introduce students who already have some background in general biology and cell biology to the study of the immune system. Course Director, 2021–current.",
          courses: [c("MIMS7530")],
        },
        {
          label: "Introduction to Science Communication",
          description:
            "This introductory course in science communication is designed to introduce the skills to effectively convey complex scientific concepts to diverse audiences, including the public, policymakers, and fellow scientists from different fields. Course Director, 2026–current.",
          courses: [c("MIMS6062")],
        },
      ],
    },
    {
      _id: "courseGroup-hi3",
      name: "Human Immunology and Immunotherapy Initiative",
      order: 5,
      icon: "vaccine",
      tileMeta: ["Fun-Size Immunology Workshop"],
      pill: "Fun-Size Immunology Workshop",
      dates: "HI3",
      intro: "A full serving of immunology in a 2.5-day ‘fun-size’ package.",
      tags: ["Fun-Size Immunology Workshop"],
      years: [
        {
          label: "Fun-Size Immunology Workshop",
          description: "A full serving of immunology in a 2.5-day ‘fun-size’ package.",
          courses: [c("Fun-Size Immunology Workshop")],
        },
      ],
    },
    {
      _id: "courseGroup-denver",
      name: "CU Denver University Honors & Leadership Program",
      order: 6,
      icon: "t-cell-grad",
      tileMeta: ["Course Director. 2015-2021"],
      pill: "Course Director",
      dates: "2015–2021",
      intro: "Course director for Scientific Thinking.",
      body: "Intensive analysis of primary and secondary literature from across the sciences designed to develop the critical thinking, content integration, and analysis skills necessary to be successful throughout academic endeavors and professional careers.",
      tags: ["Scientific Thinking"],
      years: [
        {
          label: "Scientific Thinking",
          description:
            "Intensive analysis of primary and secondary literature from across the sciences designed to develop the critical thinking, content integration, and analysis skills necessary to be successful throughout academic endeavors and professional careers.",
          courses: [c("UNHL4820")],
        },
      ],
    },
  ];

  const used = new Set<string>();
  for (const g of groups) {
    console.log(`\n${g.name} (${g._id})`);
    for (const y of g.years) for (const course of y.courses) {
      console.log(`  ${y.label}: ${course.title}`);
      used.add(course._id);
    }
  }
  const unused = all.filter((x) => !used.has(x._id));
  console.log(`\n${used.size} of ${all.length} courses placed.${unused.length ? " Not placed: " + unused.map((u) => u.title).join("; ") : ""}`);

  if (dryRun) return console.log("Dry run — nothing was written.");

  for (const g of groups) {
    await client.createOrReplace({
      ...g,
      _type: "courseGroup",
      years: g.years.map((y, i) => ({ _type: "courseYear", _key: `year-${i + 1}`, ...y, courses: y.courses.map(link) })),
    });
  }
  console.log("Wrote the six course groups.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
