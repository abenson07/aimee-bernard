"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Category, SourceKind } from "@/lib/types";
import { withHttps } from "@/lib/url";
import { createContentItem } from "./actions";
import { ChevronDownIcon, DropIcon, LockIcon } from "./icons";
import { ModalShell } from "./modal-shell";
import { RichText } from "./rich-text";

export function UploadModal({
  categories,
  lockedCategoryId,
  categorizationEnabled,
  onClose,
  onCreated,
}: {
  categories: Category[];
  lockedCategoryId: string | null;
  categorizationEnabled: boolean;
  onClose: () => void;
  onCreated?: (title: string) => void;
}) {
  const [state, formAction, pending] = useActionState(createContentItem, undefined);
  const [tab, setTab] = useState<SourceKind>("file");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /* Controlled, rather than left to defaultValue/refs, so a failed submit
     (e.g. missing category) doesn't wipe what she already typed — React
     resets uncontrolled fields on every form action dispatch, success or
     not, and re-typing a title/link/description after a validation error
     is exactly the kind of friction that reads as "the upload is broken." */
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const locked = categories.find((category) => category._id === lockedCategoryId) ?? null;

  useEffect(() => {
    if (state?.ok) {
      onCreated?.(title.trim());
      onClose();
    }
  }, [state, onClose, onCreated, title]);

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
            {/* Not `required` — same reasoning as Category below: a native
                validation block here is silent and easy to miss, and the
                server already validates and surfaces a real error. */}
            <input
              type="text"
              name="title"
              className="input"
              placeholder="Give this a name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
              <input
                type="text"
                name="url"
                className="input"
                placeholder="example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onBlur={(event) => setUrl(withHttps(event.target.value))}
              />
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
                {/* Not `required` — a native validation error on this field
                    blocks form submission silently (no request, no visible
                    feedback), which is indistinguishable from the upload
                    just not working. The server already validates this and
                    surfaces a real error below. */}
                {/* Uncontrolled on purpose — a disabled placeholder option
                    can't stay "selected" once a controlled value forces a
                    re-render to it, so the browser silently falls back to
                    the first real option, which would then read back as an
                    (unintended) selection on the next submit. defaultValue
                    avoids that; the tradeoff is that a pick here is lost if
                    some other field fails validation, same as before. */}
                <select name="category" className="input" defaultValue="">
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
