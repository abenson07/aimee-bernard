"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Category } from "@/lib/types";
import {
  PAGES,
  SECTIONS,
  validateAnswer,
  type Page,
  type Question,
  type StoredAnswer,
} from "@/lib/questionnaire";
import { CheckIcon, CloseIcon } from "../icons";
import { saveQuestionnaireAnswers } from "./actions";
import { ContentLinkControl } from "./content-link-control";
import {
  ChoiceControl,
  ChoiceWithNoteControl,
  MultiChoiceControl,
  ScaleControl,
  TextControl,
} from "./controls";
import { DoneScreen } from "./done-screen";

function upsert(answers: StoredAnswer[], question: Question, value: string | string[]): StoredAnswer[] {
  const entry: StoredAnswer = { key: question.key, question: question.prompt, type: question.type, answer: value };
  const idx = answers.findIndex((a) => a.key === question.key);
  if (idx === -1) return [...answers, entry];
  const next = [...answers];
  next[idx] = entry;
  return next;
}

/* There's no Skip button — she just leaves a field blank and moves on. So
   before every save, drop any of this page's fields that aren't actually
   answerable (blank, or a half-filled "Other") rather than persisting
   garbage. Fields on other pages are untouched. */
function cleanPage(answers: StoredAnswer[], page: Page): StoredAnswer[] {
  const fieldsByKey = new Map(page.fields.map((f) => [f.key, f]));
  return answers.filter((a) => {
    const field = fieldsByKey.get(a.key);
    return !field || validateAnswer(field, a.answer);
  });
}

export function QuestionnaireWizard({
  initialAnswers,
  initialIndex,
  initialCompleted,
  startedAt,
  completedAt: initialCompletedAt,
  contentItems,
  categories,
  categorizationEnabled,
}: {
  initialAnswers: StoredAnswer[];
  initialIndex: number;
  initialCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
  contentItems: { _id: string; title: string; venue?: string }[];
  categories: Category[];
  categorizationEnabled: boolean;
}) {
  const [answers, setAnswers] = useState(() => initialAnswers);
  const [index, setIndex] = useState(() => initialIndex);
  const [isDone, setIsDone] = useState(() => initialCompleted);
  const [completedAt, setCompletedAt] = useState(() => initialCompletedAt);
  const [error, setError] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(() =>
    initialAnswers.length > 0 || initialCompleted ? "saved" : "idle",
  );
  const [pending, startTransition] = useTransition();

  const current = PAGES[index];
  const section = SECTIONS.find((s) => s.id === current.section);
  const isGroup = current.fields.length > 1;
  const isLast = index === PAGES.length - 1;

  const setFieldValue = (field: Question, value: string | string[]) => {
    setAnswers((prev) => upsert(prev, field, value));
  };

  const save = (answersToSave: StoredAnswer[], afterSave: () => void) => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await saveQuestionnaireAnswers(answersToSave, current.key);
      if (result?.error) {
        setError(result.error);
        setSaveStatus("idle");
        return;
      }
      setError(undefined);
      setSaveStatus("saved");
      afterSave();
    });
  };

  const goToIndex = (nextIndex: number) => setIndex(nextIndex);

  const handleNext = () => {
    const cleaned = cleanPage(answers, current);
    setAnswers(cleaned);
    save(cleaned, () => {
      if (isLast) {
        setCompletedAt(new Date().toISOString());
        setIsDone(true);
        return;
      }
      goToIndex(index + 1);
    });
  };

  const handleBack = () => {
    const cleaned = cleanPage(answers, current);
    setAnswers(cleaned);
    save(cleaned, () => goToIndex(Math.max(0, index - 1)));
  };

  const handleJumpToSection = (sectionId: number) => {
    const targetIndex = PAGES.findIndex((p) => p.section === sectionId);
    if (targetIndex === -1) return;
    setError(undefined);
    setIsDone(false);
    goToIndex(targetIndex);
  };

  if (isDone) {
    return (
      <DoneScreen
        answers={answers}
        startedAt={startedAt}
        completedAt={completedAt}
        onJumpToSection={handleJumpToSection}
      />
    );
  }

  return (
    <div className="q-page">
      <header className="q-header">
        <Link href="/" className="x-btn" aria-label="Back to dashboard">
          <CloseIcon />
        </Link>
        <div>
          <span className="q-section-label">
            Section {current.section} of {SECTIONS.length} — {section?.title}
          </span>
          <span className="progress">
            Question {index + 1} of {PAGES.length}
          </span>
          {saveStatus !== "idle" && (
            <span className="save-status">
              {saveStatus === "saving" ? (
                "Saving…"
              ) : (
                <>
                  <CheckIcon size={11} weight="2" /> Saved — okay to leave anytime
                </>
              )}
            </span>
          )}
        </div>
      </header>

      <div className="modal-body">
        {current.title && <p className="q-text">{current.title}</p>}

        {current.fields.map((field) => {
          const fieldValue = answers.find((a) => a.key === field.key)?.answer;
          const showLabel = !(isGroup && field.type === "scale");
          const onChange = (value: string | string[]) => setFieldValue(field, value);

          return (
            <div key={field.key} className="q-field">
              {showLabel && (
                <>
                  <p className={isGroup ? "q-field-label" : "q-text"}>{field.prompt}</p>
                  {field.helpText && <p className="q-help">{field.helpText}</p>}
                </>
              )}

              {field.type === "text" && (
                <TextControl question={field} value={fieldValue as string | undefined} onChange={onChange} />
              )}
              {field.type === "choice" && (
                <ChoiceControl question={field} value={fieldValue as string | undefined} onChange={onChange} />
              )}
              {field.type === "choice_with_note" && (
                <ChoiceWithNoteControl
                  question={field}
                  value={fieldValue as string[] | undefined}
                  onChange={onChange}
                />
              )}
              {field.type === "multi_choice" && (
                <MultiChoiceControl
                  question={field}
                  value={fieldValue as string[] | undefined}
                  onChange={onChange}
                />
              )}
              {field.type === "scale" && (
                <ScaleControl question={field} value={fieldValue as string | undefined} onChange={onChange} />
              )}
              {field.type === "content_link" && (
                <ContentLinkControl
                  value={fieldValue as string | undefined}
                  onChange={onChange}
                  contentItems={contentItems}
                  categories={categories}
                  categorizationEnabled={categorizationEnabled}
                />
              )}
            </div>
          );
        })}

        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="modal-foot">
        <button type="button" className="btn-quiet" onClick={handleBack} disabled={pending || index === 0}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={handleNext} disabled={pending}>
          {pending ? "Saving…" : isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
