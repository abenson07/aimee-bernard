"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";
import { answerQuestion } from "./actions";
import { CheckIcon } from "./icons";
import { ModalShell } from "./modal-shell";

export function QuizModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  /* Snapshotted on open: answering revalidates the page, and the run shouldn't
     reshuffle underneath her while she's part-way through it. */
  const [questions] = useState(() => category.pending);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(answerQuestion, undefined);
  const handledRef = useRef<string | null>(null);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const isChoice = current?.questionType === "choice" && (current.options?.length ?? 0) > 0;

  const advance = () => {
    setIndex((i) => i + 1);
    setChoice(null);
  };

  useEffect(() => {
    if (state?.ok && state.key && handledRef.current !== state.key) {
      handledRef.current = state.key;
      advance();
    }
  }, [state]);

  return (
    <ModalShell
      title={category.name}
      subtitle="Helping define what belongs here."
      onClose={onClose}
    >
      {current ? (
        <form action={formAction} key={current._key}>
          <input type="hidden" name="categoryId" value={category._id} />
          <input type="hidden" name="key" value={current._key} />

          <div className="modal-body">
            <span className="progress">
              Question {index + 1} of {questions.length}
            </span>
            <p className="q-text">{current.question}</p>

            {isChoice ? (
              <>
                <div className="opts">
                  {current.options?.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={choice === option ? "opt is-picked" : "opt"}
                      onClick={() => setChoice(option)}
                      aria-pressed={choice === option}
                    >
                      <span className="opt-mark">
                        <CheckIcon />
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="answer" value={choice ?? ""} />
              </>
            ) : (
              <textarea
                name="answer"
                className="input"
                rows={4}
                placeholder="Answer in your own words…"
              />
            )}

            {state?.error && <p className="form-error">{state.error}</p>}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-quiet" onClick={advance}>
              Skip
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={pending || (isChoice && !choice)}
            >
              {pending ? "Saving…" : isLast ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="done">
            <span className="done-mark">
              <CheckIcon size={20} weight="1.7" />
            </span>
            <span className="done-title">All caught up</span>
            <span className="done-sub">
              No more questions for {category.name} right now. New ones show up here when
              they are added.
            </span>
          </div>
          <div className="modal-foot" style={{ justifyContent: "center" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
