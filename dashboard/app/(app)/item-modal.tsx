"use client";

import { useActionState, useEffect } from "react";
import type { Category, ContentItem } from "@/lib/types";
import { updateContentItem } from "./actions";
import { FileIcon, LinkIcon, TextIcon } from "./icons";
import { ModalShell } from "./modal-shell";

export function ItemModal({
  item,
  categories,
  categorizationEnabled,
  onClose,
}: {
  item: ContentItem;
  categories: Category[];
  categorizationEnabled: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateContentItem, undefined);

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <ModalShell title={item.title} subtitle="Edit how this is filed." onClose={onClose}>
      <form action={formAction}>
        <input type="hidden" name="id" value={item._id} />

        <div className="modal-body">
          <div className="field">
            <span className="label">Source</span>
            {item.url ? (
              <a
                className="locked-chip"
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "inherit" }}
              >
                <LinkIcon size={13} />
                {item.url}
              </a>
            ) : item.fileUrl ? (
              <a
                className="locked-chip"
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "inherit" }}
              >
                <FileIcon size={13} />
                {item.fileName ?? "File"}
              </a>
            ) : (
              <span className="locked-chip">
                <TextIcon size={13} />
                Written content
              </span>
            )}
          </div>

          {categorizationEnabled && (
            <>
              <label className="field">
                <span className="label">Category</span>
                <select
                  name="category"
                  className="input"
                  defaultValue={item.categoryId ?? ""}
                  required
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">
                  Why this one? <span className="opt-tag">— optional</span>
                </span>
                <textarea
                  name="categoryNote"
                  className="input"
                  rows={2}
                  defaultValue={item.categoryNote ?? ""}
                  placeholder="If it feels like it belongs somewhere else, say why."
                />
              </label>
            </>
          )}

          <label className="field">
            <span className="label">
              Description <span className="opt-tag">— optional</span>
            </span>
            <textarea
              name="description"
              className="input"
              rows={2}
              defaultValue={item.description ?? ""}
            />
          </label>

          {state?.error && <p className="form-error">{state.error}</p>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
