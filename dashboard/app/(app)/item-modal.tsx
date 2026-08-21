"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Category, ContentItem } from "@/lib/types";
import { withHttps } from "@/lib/url";
import { updateContentItem } from "./actions";
import { DropIcon, FileIcon } from "./icons";
import { ModalShell } from "./modal-shell";
import { RichText } from "./rich-text";

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

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <ModalShell title={item.title} subtitle="Edit how this is filed." onClose={onClose}>
      <form action={formAction}>
        <input type="hidden" name="id" value={item._id} />

        <div className="modal-body">
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

          {item.url ? (
            <label className="field">
              <span className="label">Link</span>
              <input
                type="text"
                name="url"
                className="input"
                defaultValue={item.url}
                onBlur={(event) => {
                  event.target.value = withHttps(event.target.value);
                }}
              />
            </label>
          ) : item.fileUrl ? (
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
            <div className="field">
              <span className="label">Content</span>
              <RichText name="body" initialValue={item.body} />
            </div>
          )}

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
