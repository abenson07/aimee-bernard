"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import type { Category } from "@/lib/types";
import { ItemModal } from "../item-modal";
import { ModalShell } from "../modal-shell";
import { discardDraft, listPhotos, loadDoc, loadPage, publishPage, saveText, savePhoto, uploadPhoto, type PageState, type Photo, type SiteDoc, type SlotValue } from "./actions";
import { CourseGroupModal, PublicationModal } from "./doc-modals";

type PageTab = { id: string; title: string; slug: string; path: string };

/** What was clicked on the page. */
type Selection = { key: string; kind: "text" | "image"; label: string; value: string; src: string; extras: string[] };

const thumb = (url: string, w: number) => `${url}?w=${w}&auto=format`;

/* Whether the pages panel is folded away, remembered in this browser. */
const COLLAPSED_KEY = "site-editor:pages-collapsed";
const collapsedListeners = new Set<() => void>();
const subscribeCollapsed = (fn: () => void) => {
  collapsedListeners.add(fn);
  return () => collapsedListeners.delete(fn);
};
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};
const writeCollapsed = (value: boolean) => {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {}
  collapsedListeners.forEach((fn) => fn());
};

export function SiteEditor({
  pages,
  currentId,
  initial,
  iframeBase,
  siteOrigin,
  categories,
  categorizationEnabled,
}: {
  pages: PageTab[];
  currentId: string;
  initial: PageState | null;
  iframeBase: string;
  siteOrigin: string;
  categories: Category[];
  categorizationEnabled: boolean;
}) {
  const [page, setPage] = useState<PageState | null>(initial);
  const [frameKey, setFrameKey] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [doc, setDoc] = useState<SiteDoc | null>(null);
  const [pending, startTransition] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);
  const scrollY = useRef(0);

  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const toggleCollapsed = () => writeCollapsed(!collapsed);

  const post = useCallback((msg: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ source: "site-editor-parent", ...msg }, siteOrigin), [siteOrigin]);
  /** Reload the page in the frame (it comes back at the same scroll position). */
  const reloadFrame = useCallback(() => {
    setSelection(null);
    setFrameKey((n) => n + 1);
  }, []);

  const run = useCallback(
    (work: () => Promise<{ ok: boolean; error?: string }>, done: string, after?: () => void) => {
      setError("");
      setStatus("Saving…");
      startTransition(async () => {
        const r = await work();
        if (!r.ok) {
          setError((r as { error: string }).error);
          setStatus("");
          return;
        }
        setPage(await loadPage(currentId));
        setStatus(done);
        after?.();
      });
    },
    [currentId],
  );

  const commitText = useCallback(
    (key: string, value: string, label: string) => {
      const slot = page?.slots.find((s) => s._key === key);
      if (slot && (slot.text ?? "").trim() === value.trim()) return;
      run(() => saveText(currentId, key, value, label), "Saved to your draft");
    },
    [currentId, page, run],
  );

  // Messages from the page inside the frame.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== siteOrigin || !e.data || e.data.source !== "site-editor") return;
      const d = e.data;
      if (d.type === "ready") post({ type: "scroll-to", y: scrollY.current });
      if (d.type === "scroll") scrollY.current = Number(d.y) || 0;
      if (d.type === "select") setSelection({ key: String(d.key), kind: d.kind === "image" ? "image" : "text", label: String(d.label ?? ""), value: String(d.value ?? ""), src: String(d.src ?? ""), extras: Array.isArray(d.extras) ? d.extras.map(String) : [] });
      if (d.type === "deselect") setSelection(null);
      if (d.type === "typing") setSelection((s) => (s && s.key === d.key ? { ...s, value: String(d.value ?? "") } : s));
      if (d.type === "text") commitText(String(d.key), String(d.value ?? ""), String(d.label ?? ""));
      if (d.type === "doc") {
        setError("");
        loadDoc(String(d.id), String(d.docType)).then((loaded) => (loaded ? setDoc(loaded) : setError("That item couldn’t be found. It may have been deleted.")));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [commitText, post, siteOrigin]);

  const slots = page?.slots ?? [];
  const slotOf = (key: string) => slots.find((s) => s._key === key);
  const pickerSlot: SlotValue | null = pickerKey ? (slotOf(pickerKey) ?? { _key: pickerKey, label: selection?.label ?? "Photo", kind: "image" }) : null;
  const current = pages.find((p) => p.id === currentId);
  const closeDoc = () => {
    setDoc(null);
    reloadFrame(); // lists come from the content log, so show the saved version
  };

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-0">
      {/* Pages */}
      <aside className={`flex shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] ${collapsed ? "w-12" : "w-56"}`}>
        <div className="flex items-center justify-between px-2 py-2">
          {!collapsed && <span className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Pages</span>}
          <button type="button" className="btn-quiet btn-sm" onClick={toggleCollapsed} aria-label={collapsed ? "Show pages" : "Hide pages"} aria-expanded={!collapsed} title={collapsed ? "Show pages" : "Hide pages"}>
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2" aria-label="Pages">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={`/site?page=${p.slug}`}
              title={p.title}
              aria-current={p.id === currentId ? "page" : undefined}
              className={`rounded-md px-2 py-2 text-sm ${p.id === currentId ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"} ${collapsed ? "text-center" : ""}`}
            >
              {collapsed ? p.title[0] : (
                <>
                  <span className="block font-medium">{p.title}</span>
                  <span className={`block text-xs ${p.id === currentId ? "text-neutral-300" : "text-neutral-500"}`}>{p.path}</span>
                </>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* The page */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
          <span className="font-medium">{current?.title}</span>
          <span className="text-sm text-neutral-600" aria-live="polite">
            {pending ? "Saving…" : error ? "" : status || (page?.hasDraft ? "Changes not live yet" : "Everything here is live")}
          </span>
          {error && <span className="text-sm text-red-700">{error}</span>}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="btn-quiet"
              disabled={!page?.hasDraft || pending}
              onClick={() => {
                if (window.confirm("Throw away your unpublished changes on this page?")) run(() => discardDraft(currentId), "Changes discarded", reloadFrame);
              }}
            >
              Discard changes
            </button>
            <button type="button" className="btn-primary" disabled={!page?.hasDraft || pending} onClick={() => run(() => publishPage(currentId), "Published. It’s live within a minute.")}>
              Publish
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-neutral-100 p-3">
          <iframe ref={frame} key={frameKey} title="Your site" src={`${iframeBase}&t=${frameKey}`} className="h-full w-full rounded-lg border border-neutral-200 bg-white" />
        </div>
      </div>

      {/* Inspector */}
      <aside className="w-80 shrink-0 overflow-y-auto border-l border-neutral-200 bg-white p-4" aria-label="Selected item">
        {selection ? (
          <Inspector
            key={selection.key}
            selection={selection}
            slotOf={slotOf}
            onTyping={(key, value) => post({ type: "set-text", key, value })}
            onCommit={commitText}
            onPhoto={setPickerKey}
            onFind={(key) => post({ type: "focus", key })}
          />
        ) : (
          <div className="space-y-3 text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">Click anything on the page to change it.</p>
            <p>
              <span className="mr-1 inline-block h-3 w-3 rounded-sm border-2 border-dashed border-blue-500 align-middle" /> Text and photos: type straight onto the page, or use this panel.
            </p>
            <p>
              <span className="mr-1 inline-block h-3 w-3 rounded-sm border-2 border-dashed border-purple-500 align-middle" /> Awards, press, courses and logos come from your content log. Clicking one opens it in a window.
            </p>
            <p>
              Text and photo changes are a draft until you press <strong>Publish</strong>. Changes made in a window go live straight away.
            </p>
          </div>
        )}
      </aside>

      {pickerSlot && (
        <PhotoPicker
          slot={pickerSlot}
          onClose={() => setPickerKey(null)}
          onUse={(photo, focus, alt) => {
            const key = pickerSlot._key;
            setPickerKey(null);
            const onPage = selection?.key === key; // its own photo; a hover photo isn't on the page until hovered
            run(() => savePhoto(currentId, key, photo.id, focus, alt), "Saved to your draft", () => {
              if (onPage) {
                post({ type: "set-image", key, src: thumb(photo.url, 1600), pos: `${Math.round(focus.x * 100)}% ${Math.round(focus.y * 100)}%` });
                setSelection((s) => (s && s.key === key ? { ...s, src: thumb(photo.url, 1600) } : s));
              } else reloadFrame();
            });
          }}
        />
      )}

      {doc?.type === "contentItem" && <ItemModal item={doc.item} categories={categories} categorizationEnabled={categorizationEnabled} onClose={closeDoc} />}
      {doc?.type === "courseGroup" && <CourseGroupModal id={doc.id} initial={doc.fields} onClose={closeDoc} />}
      {doc?.type === "publication" && <PublicationModal id={doc.id} logo={doc.logo} initial={doc.fields} onClose={closeDoc} />}
    </div>
  );
}

/** The right-hand panel for whatever was clicked: its text or photo, plus anything that belongs with it. */
function Inspector({
  selection,
  slotOf,
  onTyping,
  onCommit,
  onPhoto,
  onFind,
}: {
  selection: Selection;
  slotOf: (key: string) => SlotValue | undefined;
  onTyping: (key: string, value: string) => void;
  onCommit: (key: string, value: string, label: string) => void;
  onPhoto: (key: string) => void;
  onFind: (key: string) => void;
}) {
  const [label, ...rest] = selection.label.split(" · ").reverse();
  const where = rest.reverse().join(" · ");
  return (
    <div className="space-y-5">
      <div>
        {where && <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{where}</div>}
        <h2 className="text-base font-semibold">{label || "Selected"}</h2>
      </div>
      {selection.kind === "image" ? (
        <PhotoField src={selection.src} alt={slotOf(selection.key)?.alt ?? ""} onChange={() => onPhoto(selection.key)} />
      ) : (
        <TextField
          value={selection.value}
          long={selection.value.length > 80 || selection.value.includes("\n")}
          onTyping={(v) => onTyping(selection.key, v)}
          onCommit={(v) => onCommit(selection.key, v, selection.label)}
        />
      )}
      {selection.extras.map((key) => {
        const slot = slotOf(key);
        if (!slot) return null;
        return (
          <div key={key} className="border-t border-neutral-200 pt-4">
            <div className="mb-2 text-sm font-medium">{slot.label}</div>
            {slot.kind === "image" ? (
              <PhotoField src={slot.image?.url ? thumb(slot.image.url, 600) : ""} alt={slot.alt ?? ""} onChange={() => onPhoto(key)} />
            ) : (
              <TextField value={slot.text ?? ""} long onCommit={(v) => onCommit(key, v, slot.label)} />
            )}
          </div>
        );
      })}
      <button type="button" className="text-sm text-neutral-500 underline" onClick={() => onFind(selection.key)}>
        Show it on the page
      </button>
    </div>
  );
}

function TextField({ value, long, onTyping, onCommit }: { value: string; long: boolean; onTyping?: (v: string) => void; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  // Typing on the page updates this box too.
  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);
  return (
    <label className="block">
      <span className="sr-only">Text</span>
      <textarea
        value={draft}
        rows={long ? 5 : 2}
        onFocus={() => (focused.current = true)}
        onChange={(e) => {
          setDraft(e.target.value);
          onTyping?.(e.target.value);
        }}
        onBlur={() => {
          focused.current = false;
          if (draft.trim() && draft.trim() !== value.trim()) onCommit(draft);
        }}
        className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
      />
      <span className="mt-1 block text-xs text-neutral-500">Saves to your draft when you click away.</span>
    </label>
  );
}

function PhotoField({ src, alt, onChange }: { src: string; alt: string; onChange: () => void }) {
  return (
    <div>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="mb-3 aspect-[4/3] w-full rounded-lg object-cover" />
      ) : (
        <div className="mb-3 aspect-[4/3] w-full rounded-lg bg-neutral-100" />
      )}
      <button type="button" className="btn-secondary w-full" onClick={onChange}>
        Change photo
      </button>
      {alt && <p className="mt-2 text-xs text-neutral-500">Description: {alt}</p>}
    </div>
  );
}

function PhotoPicker({ slot, onClose, onUse }: { slot: SlotValue; onClose: () => void; onUse: (photo: Photo, focus: { x: number; y: number }, alt: string) => void }) {
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
