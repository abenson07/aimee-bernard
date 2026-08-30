"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Category } from "@/lib/types";
import {
  PAGES,
  SECTIONS,
  validateAnswer,
  type Question,
  type StoredAnswer,
} from "@/lib/questionnaire";
import { CloseIcon } from "../icons";
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
  contentItems: { _id: string; title: string }[];
  categories: Category[];
  categorizationEnabled: boolean;
}) {
  const [answers, setAnswers] = useState(() => initialAnswers);
  const [index, setIndex] = useState(() => initialIndex);
  const [isDone, setIsDone] = useState(() => initialCompleted);
  const [completedAt, setCompletedAt] = useState(() => initialCompletedAt);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const current = PAGES[index];
  const section = SECTIONS.find((s) => s.id === current.section);
  const isGroup = current.fields.length > 1;
  const isLast = index === PAGES.length - 1;
  const isValid = current.fields.every((field) => {
    const v = answers.find((a) => a.key === field.key)?.answer;
    return v !== undefined && validateAnswer(field, v);
  });

  /* Typing calls onChange on every keystroke (needed so Next can validate
     live), which immediately upserts into `answers` — but Skip and Back are
     only supposed to commit values when she explicitly says Next. This
     snapshot is "what this page's fields looked like the moment we arrived
     here," so those two can revert any uncommitted typing instead of
     silently leaking it into the next real save. */
  const arrivalSnapshot = useRef<StoredAnswer[]>(
    initialAnswers.filter((a) => PAGES[initialIndex]?.fields.some((f) => f.key === a.key)),
  );

  const revertCurrent = (from: StoredAnswer[]) => {
    const currentKeys = current.fields.map((f) => f.key);
    return [...from.filter((a) => !currentKeys.includes(a.key)), ...arrivalSnapshot.current];
  };

  const goToIndex = (nextIndex: number, fromAnswers: StoredAnswer[]) => {
    const nextKeys = PAGES[nextIndex].fields.map((f) => f.key);
    arrivalSnapshot.current = fromAnswers.filter((a) => nextKeys.includes(a.key));
    setIndex(nextIndex);
  };

  const setFieldValue = (field: Question, value: string | string[]) => {
    setAnswers((prev) => upsert(prev, field, value));
  };

  const save = (answersToSave: StoredAnswer[], afterSave: () => void) => {
    startTransition(async () => {
      const result = await saveQuestionnaireAnswers(answersToSave, current.key);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      afterSave();
    });
  };

  const handleNext = () => {
    if (!isValid) return;
    save(answers, () => {
      if (isLast) {
        setCompletedAt(new Date().toISOString());
        setIsDone(true);
        return;
      }
      goToIndex(index + 1, answers);
    });
  };

  const handleSkip = () => {
    setError(undefined);
    const reverted = revertCurrent(answers);
    setAnswers(reverted);
    if (!isLast) {
      goToIndex(index + 1, reverted);
      return;
    }
    save(reverted, () => {
      setCompletedAt(new Date().toISOString());
      setIsDone(true);
    });
  };

  const handleBack = () => {
    setError(undefined);
    const reverted = revertCurrent(answers);
    setAnswers(reverted);
    goToIndex(Math.max(0, index - 1), reverted);
  };

  const handleJumpToSection = (sectionId: number) => {
    const targetIndex = PAGES.findIndex((p) => p.section === sectionId);
    if (targetIndex === -1) return;
    setError(undefined);
    goToIndex(targetIndex, answers);
    setIsDone(false);
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
        <div className="modal-foot-actions">
          <button type="button" className="btn-quiet" onClick={handleSkip} disabled={pending}>
            Skip
          </button>
          <button type="button" className="btn-primary" onClick={handleNext} disabled={pending || !isValid}>
            {pending ? "Saving…" : isLast ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
