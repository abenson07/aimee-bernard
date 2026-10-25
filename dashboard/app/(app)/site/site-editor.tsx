"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ModalShell } from "../modal-shell";
import { discardDraft, listPhotos, loadPage, publishPage, saveText, savePhoto, uploadPhoto, type PageState, type Photo, type SlotValue } from "./actions";

type PageTab = { id: string; title: string; slug: string };

const GROUPS: Record<string, string> = {
  hover: "Portrait hover (Home)",
  working: "What Aimee’s Working On",
  hero: "Top of the page",
  programs: "Programs",
  program: "Programs",
};
const groupOf = (key: string) => GROUPS[key.split("-")[0]] ?? "Other";

const thumb = (url: string, w: number) => `${url}?w=${w}&auto=format`;

export function SiteEditor({ pages, currentId, initial, iframeBase, siteOrigin }: { pages: PageTab[]; currentId: string; initial: PageState | null; iframeBase: string; siteOrigin: string }) {
  const [page, setPage] = useState<PageState | null>(initial);
  const [reload, setReload] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(async () => {
    const next = await loadPage(currentId);
    setPage(next);
    setReload((n) => n + 1); // reload the preview so it shows the draft
  }, [currentId]);

  const save = useCallback(
    (work: () => Promise<{ ok: boolean; error?: string }>, done = "Saved to your draft") => {
      setError("");
      setStatus("Saving…");
      startTransition(async () => {
        const r = await work();
        if (!r.ok) {
          setError((r as { error: string }).error);
          setStatus("");
          return;
        }
        await refresh();
        setStatus(done);
      });
    },
    [refresh],
  );

  // Messages from the live page inside the frame (typed headings, clicks on photos).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== siteOrigin || !e.data || e.data.source !== "site-editor") return;
      const key = String(e.data.key ?? "").split(":")[1];
      if (e.data.type === "text" && key) save(() => saveText(currentId, key, String(e.data.value ?? "")));
      if (e.data.type === "image" && key) setPickerKey(key);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [currentId, save, siteOrigin]);

  const slots = page?.slots ?? [];
  const groups = [...new Set(slots.map((s) => groupOf(s._key)))];
  const pickerSlot = slots.find((s) => s._key === pickerKey) ?? null;
  const src = `${iframeBase}&t=${reload}`;

  const focusOnPage = (key: string) => frame.current?.contentWindow?.postMessage({ source: "site-editor-parent", type: "focus", key: `${currentId}:${key}` }, siteOrigin);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 px-5 py-3">
        <nav className="flex gap-2">
          {pages.map((p) => (
            <Link key={p.id} href={`/site?page=${p.slug}`} className={p.id === currentId ? "btn-primary" : "btn-secondary"}>
              {p.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-neutral-600" aria-live="polite">
            {pending ? "Saving…" : error ? "" : status || (page?.hasDraft ? "You have changes that aren’t live yet" : "Everything here is live")}
          </span>
          {error && <span className="text-sm text-red-700">{error}</span>}
          <button
            type="button"
            className="btn-quiet"
            disabled={!page?.hasDraft || pending}
            onClick={() => {
              if (window.confirm("Throw away your unpublished changes on this page?")) save(() => discardDraft(currentId), "Changes discarded");
            }}
          >
            Discard changes
          </button>
          <button type="button" className="btn-primary" disabled={!page?.hasDraft || pending} onClick={() => save(() => publishPage(currentId), "Published. It’s live within a minute.")}>
            Publish
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 bg-neutral-100 p-3">
          <iframe ref={frame} key={reload} title="Your site" src={src} className="h-full w-full rounded-lg border border-neutral-200 bg-white" />
        </div>

        <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-neutral-200 bg-white p-4">
          <p className="mb-4 text-sm text-neutral-600">
            Click a heading on the page to type over it, or a photo to change it. Everything here saves to a draft; nothing goes live until you press <strong>Publish</strong>.
          </p>
          {groups.map((g) => (
            <section key={g} className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{g}</h2>
              <ul className="space-y-3">
                {slots
                  .filter((s) => groupOf(s._key) === g)
                  .map((s) => (
                    <li key={s._key}>
                      <SlotRow slot={s} onText={(t) => save(() => saveText(currentId, s._key, t))} onPhoto={() => setPickerKey(s._key)} onFind={() => focusOnPage(s._key)} />
                    </li>
                  ))}
              </ul>
            </section>
          ))}
          {!slots.length && <p className="text-sm">This page isn’t set up for editing yet.</p>}
        </aside>
      </div>

      {pickerSlot && (
        <PhotoPicker
          slot={pickerSlot}
          onClose={() => setPickerKey(null)}
          onUse={(assetId, focus, alt) => {
            setPickerKey(null);
            save(() => savePhoto(currentId, pickerSlot._key, assetId, focus, alt));
          }}
        />
      )}
    </div>
  );
}

function SlotRow({ slot, onText, onPhoto, onFind }: { slot: SlotValue; onText: (t: string) => void; onPhoto: () => void; onFind: () => void }) {
  const [value, setValue] = useState(slot.text ?? "");
  useEffect(() => setValue(slot.text ?? ""), [slot.text]);

  if (slot.kind === "image") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2">
        {slot.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(slot.image.url, 120)} alt="" className="h-14 w-14 rounded object-cover" />
        ) : (
          <div className="h-14 w-14 rounded bg-neutral-100" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium" title={slot.label}>
            {slot.label}
          </div>
          <div className="mt-1 flex gap-3 text-sm">
            <button type="button" className="underline" onClick={onPhoto}>
              Change photo
            </button>
            <button type="button" className="text-neutral-500 underline" onClick={onFind}>
              Show on page
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-medium">
        {slot.label}
        <button type="button" className="text-xs font-normal text-neutral-500 underline" onClick={onFind}>
          Show on page
        </button>
      </span>
      <textarea
        value={value}
        rows={slot.kind === "longtext" ? 3 : 2}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value.trim() && value.trim() !== (slot.text ?? "").trim() && onText(value)}
        className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
      />
    </label>
  );
}

function PhotoPicker({ slot, onClose, onUse }: { slot: SlotValue; onClose: () => void; onUse: (assetId: string, focus: { x: number; y: number }, alt: string) => void }) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [chosen, setChosen] = useState<Photo | null>(null);
  const [focus, setFocus] = useState({ x: slot.image?.hotspot?.x ?? 0.5, y: slot.image?.hotspot?.y ?? 0.5 });
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
              <button type="button" className="btn-primary" onClick={() => onUse(chosen.id, focus, alt)}>
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
