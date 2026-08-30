"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { sanityClient } from "@/lib/sanity";
import { PAGES, QUESTIONNAIRE_DOC_ID, validateAnswer, type StoredAnswer } from "@/lib/questionnaire";

export type QuestionnaireActionState = { error?: string; ok?: boolean } | undefined;

/**
 * Called after every Next/Skip. `answers` is the full accumulated array (the
 * client already holds it all in memory), and `pageKey` is whichever page
 * was just advanced past — answered or skipped, possibly with several
 * fields at once. Completion is "reached the end of the sequence," not
 * "everything answered," so this still needs to run (with no new entries)
 * when the *last* page is skipped, purely to stamp `completedAt`.
 */
export async function saveQuestionnaireAnswers(
  answers: StoredAnswer[],
  pageKey: string,
): Promise<QuestionnaireActionState> {
  await verifySession();

  const page = PAGES.find((p) => p.key === pageKey);
  if (!page) {
    return { error: "That didn't save. Try again." };
  }

  for (const field of page.fields) {
    const provided = answers.find((a) => a.key === field.key);
    if (provided && !validateAnswer(field, provided.answer)) {
      return { error: "That didn't save. Try again." };
    }
  }

  const isFinal = pageKey === PAGES[PAGES.length - 1].key;

  try {
    await sanityClient.createIfNotExists({
      _id: QUESTIONNAIRE_DOC_ID,
      _type: "quizResponse",
      answers: "[]",
    });

    await sanityClient
      .patch(QUESTIONNAIRE_DOC_ID)
      .set({
        answers: JSON.stringify(answers),
        ...(isFinal ? { completedAt: new Date().toISOString() } : {}),
      })
      .commit();
  } catch {
    return { error: "That didn't save. Try again." };
  }

  revalidatePath("/questionnaire");
  return { ok: true };
}
