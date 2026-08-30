"use client";

import { useActionState, useEffect, useState } from "react";
import type { Category, ContentItem } from "@/lib/types";
import { reviewCategory } from "./actions";
import { itemContext } from "./category-suggestion";
import { ModalShell } from "./modal-shell";

export function CategoryChangeModal({
  item,
  categories,
  onClose,
}: {
  item: ContentItem;
  categories: Category[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(reviewCategory, undefined);
  const [primary, setPrimary] = useState("");

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  const primaryOptions = categories.filter((category) => category._id !== item.categoryId);
  const secondaryOptions = categories.filter((category) => category._id !== primary);

  return (
    <ModalShell
      title={item.title}
      subtitle={itemContext(item) || "Choose a different category."}
      onClose={onClose}
    >
      <form action={formAction}>
        <input type="hidden" name="id" value={item._id} />

        <div className="modal-body">
          <div className="field">
            <span className="label">Currently</span>
            <div className="suggestion-chips">
              <span className="chip">{item.categoryName ?? "Unsorted"}</span>
              {item.categorySecondaryName && (
                <span className="chip chip-outline">{item.categorySecondaryName}</span>
              )}
            </div>
          </div>

          <label className="field">
            <span className="label">New category</span>
            <select
              name="category"
              className="input"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
              required
            >
              <option value="" disabled>
                Choose a category
              </option>
              {primaryOptions.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">
              Secondary <span className="opt-tag">— optional</span>
            </span>
            <select key={primary} name="categorySecondary" className="input" defaultValue="">
              <option value="">— none —</option>
              {secondaryOptions.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Why?</span>
            <textarea
              name="categoryNote"
              className="input"
              rows={3}
              required
              placeholder="What made this the right call?"
            />
          </label>

          {state?.error && <p className="form-error">{state.error}</p>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={pending || !primary}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
