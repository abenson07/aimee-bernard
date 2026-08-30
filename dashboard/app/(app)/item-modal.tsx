"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { KIND_OPTIONS, type Category, type ContentItem } from "@/lib/types";
import { withHttps } from "@/lib/url";
import { deleteContentItem, updateContentItem } from "./actions";
import { itemContext } from "./category-suggestion";
import { DropIcon, FileIcon } from "./icons";
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
  const [replacementName, setReplacementName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const link = item.url || item.firstLinkUrl || "";
  const [selectedCategory, setSelectedCategory] = useState(item.categoryId ?? "");
  const recommendedCategory = item.categorySuggestedId ?? item.categoryId ?? "";
  const recommendedCategoryName = item.categorySuggestedName ?? item.categoryName ?? "";
  const categoryChanged = selectedCategory !== "" && selectedCategory !== recommendedCategory;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteContentItem(item._id);
      if (result?.error) {
        setDeleteError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <ModalShell
      title={item.title}
      subtitle={itemContext(item) || "Edit how this is filed."}
      onClose={onClose}
    >
      <form action={formAction}>
        <input type="hidden" name="id" value={item._id} />

        <div className="modal-body">
          {editingDetails ? (
            <>
              <label className="field">
                <span className="label">Title</span>
                <input
                  type="text"
                  name="title"
                  className="input"
                  defaultValue={item.title}
                  required
                />
              </label>

              <label className="field">
                <span className="label">Kind</span>
                <select name="kind" className="input" defaultValue={item.kind ?? ""} required>
                  <option value="" disabled>
                    Choose a kind
                  </option>
                  {KIND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">
                  Venue <span className="opt-tag">— optional</span>
                </span>
                <input type="text" name="venue" className="input" defaultValue={item.venue ?? ""} />
              </label>

              <label className="field">
                <span className="label">
                  Date <span className="opt-tag">— optional</span>
                </span>
                <input
                  type="text"
                  name="date"
                  className="input"
                  defaultValue={item.date ?? ""}
                  placeholder="e.g. April 2026"
                />
              </label>

              {item.fileUrl ? (
                <div className="field">
                  <span className="label">File</span>
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
                  <input
                    type="file"
                    name="file"
                    ref={fileRef}
                    hidden
                    onChange={(event) => setReplacementName(event.target.files?.[0]?.name ?? null)}
                  />
                  <button
                    type="button"
                    className="dropzone"
                    onClick={() => fileRef.current?.click()}
                  >
                    <DropIcon size={18} />
                    <span className="dz-strong">
                      {replacementName ? replacementName : "Replace with a different file"}
                    </span>
                  </button>
                </div>
              ) : (
                <label className="field">
                  <span className="label">Link</span>
                  <input
                    type="text"
                    name="url"
                    className="input"
                    defaultValue={link}
                    placeholder="https://…"
                    onBlur={(event) => {
                      event.target.value = withHttps(event.target.value);
                    }}
                  />
                </label>
              )}

              <button
                type="button"
                className="btn-quiet btn-sm details-toggle"
                onClick={() => setEditingDetails(false)}
              >
                Hide details
              </button>
            </>
          ) : (
            <div className="field field-row">
              {item.fileUrl ? (
                <a className="label link-label" href={item.fileUrl} target="_blank" rel="noreferrer">
                  File
                </a>
              ) : link ? (
                <a className="label link-label" href={link} target="_blank" rel="noreferrer">
                  Link
                </a>
              ) : (
                <span className="label">Link</span>
              )}
              <button
                type="button"
                className="btn-quiet btn-sm"
                onClick={() => setEditingDetails(true)}
              >
                Edit details
              </button>
            </div>
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

          {categorizationEnabled && (
            <>
              <div className="modal-divider" />

              <label className="field">
                <span className="label">Category</span>
                <select
                  name="category"
                  className="input"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
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
                {categoryChanged ? (
                  recommendedCategoryName && (
                    <p className="suggestion-rationale">
                      Recommended: {recommendedCategoryName}{" "}
                      <button
                        type="button"
                        className="reset-link"
                        onClick={() => setSelectedCategory(recommendedCategory)}
                      >
                        Reset
                      </button>
                    </p>
                  )
                ) : (
                  item.categoryRationale && (
                    <p className="suggestion-rationale">{item.categoryRationale}</p>
                  )
                )}
              </label>

              {categoryChanged ? (
                <label className="field">
                  <span className="label">Why do you think it should be here?</span>
                  <textarea
                    name="categoryNote"
                    className="input"
                    rows={2}
                    defaultValue={item.categoryNote ?? ""}
                    placeholder="What made this the right call instead?"
                  />
                </label>
              ) : (
                item.categoryNote && (
                  <input type="hidden" name="categoryNote" value={item.categoryNote} />
                )
              )}
            </>
          )}

          {state?.error && <p className="form-error">{state.error}</p>}
        </div>

        {confirmDelete ? (
          <div className="modal-foot confirm-delete">
            <p className="confirm-delete-text">Delete this item? This can&apos;t be undone.</p>
            {deleteError && <p className="form-error">{deleteError}</p>}
            <div className="confirm-delete-actions">
              <button
                type="button"
                className="btn-quiet"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Keep it
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-foot">
            <button
              type="button"
              className="btn-danger-text"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
            <div className="modal-foot-actions">
              <button type="button" className="btn-quiet" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </form>
    </ModalShell>
  );
}
