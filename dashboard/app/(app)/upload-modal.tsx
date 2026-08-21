"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Category, SourceKind } from "@/lib/types";
import { createContentItem } from "./actions";
import { ChevronDownIcon, DropIcon, LockIcon } from "./icons";
import { ModalShell } from "./modal-shell";
import { RichText } from "./rich-text";

export function UploadModal({
  categories,
  lockedCategoryId,
  categorizationEnabled,
  onClose,
}: {
  categories: Category[];
  lockedCategoryId: string | null;
  categorizationEnabled: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createContentItem, undefined);
  const [tab, setTab] = useState<SourceKind>("file");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const locked = categories.find((category) => category._id === lockedCategoryId) ?? null;

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <ModalShell
      title="Upload content"
      subtitle="Add a file, a link, or something you have written."
      onClose={onClose}
    >
      <form action={formAction}>
        <div className="modal-body">
          <label className="field">
            <span className="label">Title</span>
            <input
              type="text"
              name="title"
              className="input"
              placeholder="Give this a name"
              required
            />
          </label>

          <div className="field">
            <span className="label">Source</span>
            <div className="segmented">
              {(
                [
                  ["file", "File"],
                  ["url", "Link"],
                  ["body", "Content"],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={tab === value ? "seg is-on" : "seg"}
                  onClick={() => setTab(value)}
                  aria-pressed={tab === value}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Kept mounted so switching tabs never drops a chosen file. */}
            <input
              type="file"
              name="file"
              ref={fileRef}
              hidden
              disabled={tab !== "file"}
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
            />

            {tab === "file" && (
              <button
                type="button"
                className="dropzone"
                onClick={() => fileRef.current?.click()}
              >
                <DropIcon />
                <span className="dz-strong">
                  Drop a file here or <u>browse</u>
                </span>
                {fileName ? (
                  <span className="dz-file">{fileName}</span>
                ) : (
                  <span className="dz-hint">PDF, DOC, image, or video — up to 25 MB</span>
                )}
              </button>
            )}

            {tab === "url" && (
              <input type="url" name="url" className="input" placeholder="https://" />
            )}

            {tab === "body" && <RichText name="body" />}
          </div>

          {categorizationEnabled && (
          <div className="field">
            <span className="label">Category</span>
            {locked ? (
              <>
                <span className="locked-chip">
                  <LockIcon />
                  {locked.name}
                </span>
                <input type="hidden" name="category" value={locked._id} />
              </>
            ) : (
              <div style={{ position: "relative", display: "flex" }}>
                <select name="category" className="input" required defaultValue="">
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                >
                  <ChevronDownIcon />
                </span>
              </div>
            )}
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
              placeholder="What is this, in a line or two?"
            />
          </label>

          {state?.error && <p className="form-error">{state.error}</p>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
