"use client";

import { useState, useTransition } from "react";
import { ModalShell } from "../modal-shell";
import {
  saveCourseGroup,
  savePublication,
  type CourseGroupFields,
  type PublicationFields,
} from "./actions";

/* Windows for the Sanity items clicked on the page that are not content-log items
   (those open the content log's own item window). Both save straight to the live site. */

const lines = (list: string[]) => list.join("\n");
const unlines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function Foot({
  pending,
  error,
  onClose,
}: {
  pending: boolean;
  error: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-foot">
      {error && <p className="form-error">{error}</p>}
      <button
        type="button"
        className="btn-quiet"
        onClick={onClose}
        disabled={pending}
      >
        Cancel
      </button>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

export function CourseGroupModal({
  id,
  initial,
  onClose,
  onSaved,
  inline = false,
}: {
  id: string;
  initial: CourseGroupFields;
  onClose: () => void;
  onSaved?: () => void;
  inline?: boolean;
}) {
  const [f, setF] = useState({
    ...initial,
    tileMeta: lines(initial.tileMeta),
    tags: lines(initial.tags),
  });
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: e.target.value });

  return (
    <ModalShell
      title="Course tile"
      subtitle="Saves straight to the live site. The years and courses inside the panel are edited in Studio."
      onClose={onClose}
      inline={inline}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await saveCourseGroup(id, {
              ...f,
              tileMeta: unlines(f.tileMeta),
              tags: unlines(f.tags),
            });
            if (r.ok) {
              onSaved?.();
              onClose();
            } else setError(r.error);
          });
        }}
      >
        <div className="modal-body">
          <label className="field">
            <span className="label">Name</span>
            <input
              className="input"
              value={f.name}
              onChange={set("name")}
              required
            />
          </label>
          <label className="field">
            <span className="label">
              Lines under the name on the tile (one per line)
            </span>
            <textarea
              className="input"
              rows={2}
              value={f.tileMeta}
              onChange={set("tileMeta")}
            />
          </label>
          <label className="field">
            <span className="label">Panel label</span>
            <input
              className="input"
              value={f.pill}
              onChange={set("pill")}
              placeholder="Immunology — Content Director"
            />
          </label>
          <label className="field">
            <span className="label">Panel dates</span>
            <input
              className="input"
              value={f.dates}
              onChange={set("dates")}
              placeholder="2020–current · Years 1–4"
            />
          </label>
          <label className="field">
            <span className="label">Panel intro</span>
            <textarea
              className="input"
              rows={3}
              value={f.intro}
              onChange={set("intro")}
            />
          </label>
          <label className="field">
            <span className="label">Panel text</span>
            <textarea
              className="input"
              rows={4}
              value={f.body}
              onChange={set("body")}
            />
          </label>
          <label className="field">
            <span className="label">Panel tags (one per line)</span>
            <textarea
              className="input"
              rows={3}
              value={f.tags}
              onChange={set("tags")}
            />
          </label>
        </div>
        <Foot pending={pending} error={error} onClose={onClose} />
      </form>
    </ModalShell>
  );
}

export function PublicationModal({
  id,
  logo,
  initial,
  onClose,
  onSaved,
  inline = false,
}: {
  id: string;
  logo: string | null;
  initial: PublicationFields;
  onClose: () => void;
  onSaved?: () => void;
  inline?: boolean;
}) {
  const [f, setF] = useState({
    name: initial.name,
    url: initial.url,
    stripOrder: initial.stripOrder === null ? "" : String(initial.stripOrder),
  });
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <ModalShell
      title="Logo"
      subtitle="Saves straight to the live site. To swap the logo picture itself, use Studio."
      onClose={onClose}
      inline={inline}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await savePublication(id, {
              name: f.name,
              url: f.url,
              stripOrder:
                f.stripOrder.trim() === "" ? null : Number(f.stripOrder),
            });
            if (r.ok) {
              onSaved?.();
              onClose();
            } else setError(r.error);
          });
        }}
      >
        <div className="modal-body">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${logo}?w=400&auto=format`}
              alt=""
              className="mb-4 max-h-16 w-auto"
            />
          )}
          <label className="field">
            <span className="label">Outlet name</span>
            <input
              className="input"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span className="label">Website</span>
            <input
              className="input"
              value={f.url}
              onChange={(e) => setF({ ...f, url: e.target.value })}
              placeholder="https://"
            />
          </label>
          <label className="field">
            <span className="label">
              Position in the logo strip (1 is first; leave empty to take it out
              of the strip)
            </span>
            <input
              className="input"
              inputMode="numeric"
              value={f.stripOrder}
              onChange={(e) =>
                setF({
                  ...f,
                  stripOrder: e.target.value.replace(/[^\d.]/g, ""),
                })
              }
            />
          </label>
        </div>
        <Foot pending={pending} error={error} onClose={onClose} />
      </form>
    </ModalShell>
  );
}
