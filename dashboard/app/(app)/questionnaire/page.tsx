import { categorizationEnabled } from "@/lib/flags";
import { sanityClient } from "@/lib/sanity";
import { PAGES, QUESTIONNAIRE_DOC_ID, type StoredAnswer } from "@/lib/questionnaire";
import type { Category } from "@/lib/types";
import { QuestionnaireWizard } from "./questionnaire-wizard";

const QUESTIONNAIRE_QUERY = `*[_id == $id][0]{ answers, completedAt, _createdAt }`;
const CONTENT_ITEMS_QUERY = `*[_type == "contentItem"] | order(title asc){ _id, title }`;
const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc){ _id, name }`;

export default async function QuestionnairePage() {
  const [doc, contentItems, categoryRows] = await Promise.all([
    sanityClient.fetch<{
      answers?: string;
      completedAt?: string;
      _createdAt?: string;
    } | null>(QUESTIONNAIRE_QUERY, { id: QUESTIONNAIRE_DOC_ID }),
    sanityClient.fetch<{ _id: string; title: string }[]>(CONTENT_ITEMS_QUERY),
    categorizationEnabled
      ? sanityClient.fetch<{ _id: string; name: string }[]>(CATEGORIES_QUERY)
      : Promise.resolve([]),
  ]);

  const categories: Category[] = categoryRows.map((row) => ({
    _id: row._id,
    name: row.name,
    count: 0,
    pending: [],
  }));

  let savedAnswers: StoredAnswer[] = [];
  try {
    savedAnswers = doc?.answers ? JSON.parse(doc.answers) : [];
  } catch {
    savedAnswers = [];
  }

  const completed = Boolean(doc?.completedAt);
  const firstUnfinished = PAGES.findIndex((page) =>
    page.fields.some((field) => !savedAnswers.some((answer) => answer.key === field.key)),
  );
  const initialIndex = firstUnfinished === -1 ? PAGES.length - 1 : firstUnfinished;

  return (
    <QuestionnaireWizard
      initialAnswers={savedAnswers}
      initialIndex={initialIndex}
      initialCompleted={completed}
      startedAt={doc?._createdAt}
      completedAt={doc?.completedAt}
      contentItems={contentItems}
      categories={categories}
      categorizationEnabled={categorizationEnabled}
    />
  );
}
