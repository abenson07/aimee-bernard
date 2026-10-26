"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "../modal-shell";
import { listPhotos, uploadPhoto, type Photo, type SlotValue } from "./actions";

export const thumb = (url: string, w: number) => `${url}?w=${w}&auto=format`;

/** Choose a photo from the library (or upload one), then click its focus point and describe it. */
export function PhotoPicker({
  slot,
  initial = null,
  onClose,
  onUse,
}: {
  slot: SlotValue;
  /** Start on this photo (picked from the Photos panel) instead of the library. */
  initial?: Photo | null;
  onClose: () => void;
  onUse: (photo: Photo, focus: { x: number; y: number }, alt: string) => void;
}) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [chosen, setChosen] = useState<Photo | null>(initial);
  const [focus, setFocus] = useState(initial ? { x: 0.5, y: 0.5 } : { x: slot.image?.hotspot?.x ?? 0.5, y: slot.image?.hotspot?.y ?? 0.5 });
  const [alt, setAlt] = useState(slot.alt ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listPhotos().then(setPhotos);
  }, []);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("file", file);
    const r = await uploadPhoto(fd);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setPhotos((p) => [r.photo, ...(p ?? [])]);
    setChosen(r.photo);
    setFocus({ x: 0.5, y: 0.5 });
  };

  return (
    <ModalShell title="Choose a photo" subtitle={slot.label} onClose={onClose}>
      <div className="modal-body">
        {chosen ? (
          <div>
            <p className="mb-2 text-sm">Click the most important part of the photo. That spot stays in view when the page crops it.</p>
            <div
              className="relative mx-auto max-w-[640px] cursor-crosshair overflow-hidden rounded-lg"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setFocus({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(chosen.url, 900)} alt="" className="block w-full" draggable={false} />
              <span className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_0_0_2px_rgba(0,0,0,.5)]" style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }} />
            </div>
            <label className="mt-3 block text-sm">
              Describe the photo (read aloud to people who can’t see it)
              <input value={alt} onChange={(e) => setAlt(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" />
            </label>
            <div className="mt-4 flex gap-3">
              <button type="button" className="btn-primary" onClick={() => onUse(chosen, focus, alt)}>
                Use this photo
              </button>
              <button type="button" className="btn-secondary" onClick={() => setChosen(null)}>
                Back
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="btn-secondary inline-block cursor-pointer">
              {busy ? "Uploading…" : "Upload a new photo"}
              <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
            <h3 className="mb-2 mt-5 text-sm font-semibold">Photos you’ve already uploaded</h3>
            {!photos ? (
              <p className="text-sm">Loading…</p>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="block w-full overflow-hidden rounded-lg border border-neutral-200 hover:border-blue-500" title={p.name} onClick={() => { setChosen(p); setFocus({ x: 0.5, y: 0.5 }); }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb(p.url, 240)} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
