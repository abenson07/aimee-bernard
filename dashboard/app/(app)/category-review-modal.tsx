"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { Category, ContentItem } from "@/lib/types";
import { reviewCategory } from "./actions";
import { CategorySuggestion, itemContext } from "./category-suggestion";
import { CheckIcon } from "./icons";
import { ModalShell } from "./modal-shell";

export function CategoryReviewModal({
  items,
  categories,
  onClose,
}: {
  items: ContentItem[];
  categories: Category[];
  onClose: () => void;
}) {
  /* Snapshotted on open, same reasoning as the quiz: a save revalidates the
     page, and the queue shouldn't reshuffle underneath her mid-review.
     Flagged ones go first, while she's fresh. */
  const [queue] = useState(() =>
    items
      .filter((item) => item.categorySuggestedId && !item.categoryReviewedAt)
      .sort((a, b) => Number(b.categoryFlaggedForReview) - Number(a.categoryFlaggedForReview)),
  );
  const [index, setIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(reviewCategory, undefined);
  const handledRef = useRef<string | null>(null);

  const current = queue[index];
  const isLast = index === queue.length - 1;

  const advance = () => {
    setIndex((i) => i + 1);
    setChanging(false);
    setValidationError(null);
  };

  useEffect(() => {
    if (state?.ok && state.key && handledRef.current !== state.key) {
      handledRef.current = state.key;
      advance();
    }
  }, [state]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const pickedPrimary = data.get("category");
    const pickedSecondary = data.get("categorySecondary") || null;
    const note = data.get("categoryNote");
    const changed =
      pickedPrimary !== (current.categorySuggestedId ?? null) ||
      pickedSecondary !== (current.categorySuggestedSecondaryId ?? null);

    if (changed && (typeof note !== "string" || !note.trim())) {
      event.preventDefault();
      setValidationError("Say why you're changing this.");
    } else {
      setValidationError(null);
    }
  };

  return (
    <ModalShell
      title="Review categories"
      subtitle="Confirm or correct what each item was sorted into."
      onClose={onClose}
    >
      {current ? (
        <form action={formAction} onSubmit={handleSubmit} key={current._id}>
          <input type="hidden" name="id" value={current._id} />

          <div className="modal-body">
            <span className="progress">
              Item {index + 1} of {queue.length}
            </span>
            <p className="q-text">{current.title}</p>
            {itemContext(current) && <p className="suggestion-rationale">{itemContext(current)}</p>}

            <CategorySuggestion item={current} />

            {changing ? (
              <>
                <label className="field">
                  <span className="label">Category</span>
                  <select
                    name="category"
                    className="input"
                    defaultValue={current.categorySuggestedId}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">
                    Secondary category <span className="opt-tag">— optional</span>
                  </span>
                  <select
                    name="categorySecondary"
                    className="input"
                    defaultValue={current.categorySuggestedSecondaryId ?? ""}
                  >
                    <option value="">— none —</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">Why the change?</span>
                  <textarea
                    name="categoryNote"
                    className="input"
                    rows={2}
                    defaultValue={current.categoryNote ?? ""}
                    placeholder="What made this the right call instead?"
                  />
                </label>
              </>
            ) : (
              <input type="hidden" name="category" value={current.categorySuggestedId ?? ""} />
            )}

            {!changing && current.categorySuggestedSecondaryId && (
              <input
                type="hidden"
                name="categorySecondary"
                value={current.categorySuggestedSecondaryId}
              />
            )}

            {(validationError || state?.error) && (
              <p className="form-error">{validationError ?? state?.error}</p>
            )}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-quiet" onClick={advance}>
              Skip
            </button>
            <div className="modal-foot-actions">
              <button
                type="button"
                className="btn-quiet"
                onClick={() => {
                  setChanging((value) => !value);
                  setValidationError(null);
                }}
              >
                {changing ? "Cancel" : "Change it"}
              </button>
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving…" : changing ? "Save change" : "Looks right"}
              </button>
            </div>
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
              {queue.length === 0
                ? "Nothing waiting for review right now."
                : "That's everyone — new suggestions show up here when they're added."}
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
