"use client";

/* The Site editor, laid out like Stacki (https://github.com/flowtricks/stacki): a title bar with the
   page switcher and Publish, an icon rail with Pages / Navigator / Content / Photos panels, the
   live page in the middle, and on the right whatever is selected on it. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { Category, ContentItem } from "@/lib/types";
import { KIND_OPTIONS } from "@/lib/types";
import { logout } from "../actions";
import { Dashboard } from "../dashboard";
import { BotGaps } from "../bot-gaps/bot-gaps";
import { ItemModal } from "../item-modal";
import { ModalShell } from "../modal-shell";
import {
  discardDraft,
  listPhotos,
  loadDoc,
  loadPage,
  publishPage,
  saveAlt,
  savePhoto,
  saveText,
  uploadPhoto,
  type PageState,
  type Photo,
  type SiteDoc,
  type SlotValue,
} from "./actions";
import { CourseGroupModal, PublicationModal } from "./doc-modals";
import {
  AssetManagerIcon,
  CheckIcon,
  ChevronDownIcon,
  CmsIcon,
  CollectionIcon,
  DesktopIcon,
  ElementButtonIcon,
  ElementH2Icon,
  ElementImageIcon,
  ElementPIcon,
  BugIcon,
  ExternalIcon,
  InfoIcon,
  PagePanelIcon,
  PhoneIcon,
  PlusIcon,
  TabletIcon,
  TextIcon,
  UploadCloudIcon,
} from "./icons";
import { PhotoPicker, thumb } from "./photo-picker";

type PageTab = { id: string; title: string; slug: string; path: string };
/** What is selected on the page (text or a photo; Sanity items show their own form instead). */
type Selection = {
  key: string;
  kind: "text" | "image";
  name: string;
  section: string;
  value: string;
  src: string;
  alt: string;
  extras: string[];
};
type RailTab = "content" | "photos" | "gaps";

const RAIL: {
  id: RailTab;
  title: string;
  Icon: (p: { size?: number }) => ReactNode;
}[] = [
  { id: "content", title: "Content log", Icon: CmsIcon },
  { id: "photos", title: "Photos", Icon: AssetManagerIcon },
  { id: "gaps", title: "Bot content gaps", Icon: BugIcon },
];

const DEVICES = [
  { id: "desktop", title: "Desktop", width: null, Icon: DesktopIcon },
  { id: "tablet", title: "Tablet", width: 768, Icon: TabletIcon },
  { id: "phone", title: "Phone", width: 390, Icon: PhoneIcon },
] as const;
type Device = (typeof DEVICES)[number]["id"];

function itemIcon(item: { kind: string; name: string }, size = 14) {
  if (item.kind === "doc") return <CollectionIcon size={size} />;
  if (item.kind === "image") return <ElementImageIcon size={size} />;
  if (item.name === "Heading") return <ElementH2Icon size={size} />;
  if (item.name === "Paragraph") return <ElementPIcon size={size} />;
  if (item.name === "Button text") return <ElementButtonIcon size={size} />;
  return <TextIcon size={size} />;
}

export function Studio({
  pages,
  currentId,
  initial,
  iframeBase,
  siteOrigin,
  categories,
  items,
  botGaps,
  categorizationEnabled,
}: {
  pages: PageTab[];
  currentId: string;
  initial: PageState | null;
  iframeBase: string;
  siteOrigin: string;
  categories: Category[];
  items: ContentItem[];
  botGaps: React.ComponentProps<typeof BotGaps>["groups"];
  categorizationEnabled: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState<PageState | null>(initial);
  const [frameKey, setFrameKey] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<RailTab | null>(null);
  const [contentKind, setContentKind] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [doc, setDoc] = useState<SiteDoc | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [picker, setPicker] = useState<{
    key: string;
    initial: Photo | null;
  } | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const scrollY = useRef(0);

  const current = pages.find((p) => p.id === currentId) ?? pages[0];
  const showingContent = tab === "content" || tab === "gaps";
  // The page in the frame says "ready" once the editor's hooks are running; if it never does, say so.
  const [linked, setLinked] = useState(false);
  const [noLink, setNoLink] = useState(false);
  // Bumped by the + in the Content log header; the list opens its Upload window when it changes.
  const [uploadTick, setUploadTick] = useState(0);

  const post = useCallback(
    (msg: Record<string, unknown>) =>
      frame.current?.contentWindow?.postMessage(
        { source: "site-editor-parent", ...msg },
        siteOrigin,
      ),
    [siteOrigin],
  );
  /** Reload the page in the frame (it comes back at the same scroll position). */
  const reloadFrame = useCallback(() => {
    setSelection(null);
    setDoc(null);
    setFrameKey((n) => n + 1);
  }, []);

  const run = useCallback(
    (
      work: () => Promise<{ ok: boolean; error?: string }>,
      done: string,
      after?: () => void,
    ) => {
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
      if (e.origin !== siteOrigin || !e.data || e.data.source !== "site-editor")
        return;
      const d = e.data;
      if (d.type === "ready") {
        setLinked(true);
        setNoLink(false);
        post({ type: "scroll-to", y: scrollY.current });
      }
      if (d.type === "scroll") scrollY.current = Number(d.y) || 0;
      if (d.type === "select") {
        setDoc(null);
        setSelection({
          key: String(d.key),
          kind: d.kind === "image" ? "image" : "text",
          name: String(d.name ?? ""),
          section: String(d.section ?? ""),
          value: String(d.value ?? ""),
          src: String(d.src ?? ""),
          alt: String(d.alt ?? ""),
          extras: Array.isArray(d.extras) ? d.extras.map(String) : [],
        });
      }
      if (d.type === "deselect") {
        setSelection(null);
        setDoc(null);
      }
      if (d.type === "typing")
        setSelection((s) =>
          s && s.key === d.key ? { ...s, value: String(d.value ?? "") } : s,
        );
      if (d.type === "text")
        commitText(String(d.key), String(d.value ?? ""), String(d.label ?? ""));
      if (d.type === "doc") {
        setSelection(null);
        setError("");
        loadDoc(String(d.id), String(d.docType)).then((loaded) =>
          loaded
            ? setDoc(loaded)
            : setError(
                "That item couldn’t be found. It may have been deleted.",
              ),
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [commitText, post, siteOrigin]);

  useEffect(() => {
    setLinked(false);
    setNoLink(false);
    const timer = setTimeout(() => setNoLink(true), 6000);
    return () => clearTimeout(timer);
  }, [frameKey, currentId]);
  useEffect(() => {
    if (linked) setNoLink(false);
  }, [linked]);

  const slotOf = useCallback(
    (key: string) => page?.slots.find((s) => s._key === key),
    [page],
  );
  const pickerSlot: SlotValue | null = picker
    ? (slotOf(picker.key) ?? {
        _key: picker.key,
        label: "Photo",
        kind: "image",
      })
    : null;

  // Closing the panel just deselects. After a save the page is reloaded to show the saved version.
  const closeDoc = useCallback(() => {
    setDoc(null);
    post({ type: "deselect" });
  }, [post]);
  const docSaved = useCallback(() => {
    reloadFrame();
    router.refresh();
  }, [reloadFrame, router]);

  // Names a photo that isn't in the page's slot list yet (it gets added on first save).
  const photoLabel = (key: string) =>
    selection && selection.key === key
      ? `${selection.section} · ${selection.name}`
      : "";

  const applyPhoto = (
    key: string,
    photo: Photo,
    focus: { x: number; y: number },
    alt: string,
  ) => {
    setPicker(null);
    const onPage = selection?.key === key; // its own photo; a hover photo isn't on the page until hovered
    run(
      () => savePhoto(currentId, key, photo.id, focus, alt, photoLabel(key)),
      "Saved to your draft",
      () => {
        if (!onPage) return reloadFrame();
        const src = thumb(photo.url, 1600);
        post({
          type: "set-image",
          key,
          src,
          pos: `${Math.round(focus.x * 100)}% ${Math.round(focus.y * 100)}%`,
          alt,
        });
        setSelection((s) => (s && s.key === key ? { ...s, src, alt } : s));
      },
    );
  };

  const statusText = pending
    ? "Saving…"
    : status || (page?.hasDraft ? "Draft changes" : "Live");

  return (
    <div className="studio">
      {/* Title bar */}
      <header className="st-titlebar">
        <AccountMenu />
        <span className="st-spacer" />
        <div className="st-tb-side right">
        <span
          className={`st-dot ${page?.hasDraft ? "draft" : "live"}`}
          aria-hidden="true"
        />
        <span
          className={`st-status ${error ? "error" : ""}`}
          aria-live="polite"
          title={error || undefined}
        >
          {error || statusText}
        </span>
        <button
          type="button"
          className="st-btn ghost"
          disabled={!page?.hasDraft || pending}
          onClick={() => setConfirmDiscard(true)}
        >
          Discard
        </button>
        <button
          type="button"
          className="st-btn primary"
          disabled={!page?.hasDraft || pending}
          onClick={() =>
            run(
              () => publishPage(currentId),
              "Published. Live within a minute.",
            )
          }
        >
          Publish
        </button>
        </div>
      </header>

      <div className="st-body">
        <div className="st-leftcol">
        {/* The bar spans the left panel and the page; the inspector sits beside it, full height */}
          <div className="st-toolbar">
            <div className="st-crumbs st-tools" role="toolbar" aria-label="Panels">
              <button
                type="button"
                className={`st-rail-btn ${!showingContent ? "on" : ""}`}
                aria-pressed={!showingContent}
                aria-label="Page"
                data-tip="Page"
                onClick={() => setTab(null)}
              >
                <PagePanelIcon size={18} />
              </button>
              {RAIL.map(({ id, title, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`st-rail-btn ${tab === id ? "on" : ""}`}
                  aria-pressed={tab === id}
                  aria-label={title}
                  data-tip={title}
                  onClick={() => setTab((t) => (t === id ? null : id))}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <div className="st-tb-mid">
              <PageSwitcher pages={pages} current={current} />
              <a
                className="st-icon-btn"
                href={`${siteOrigin}${current.path}`}
                target="_blank"
                rel="noreferrer"
                title="View the live page in a new tab"
              >
                <ExternalIcon size={13} />
              </a>
            </div>
            <div className="st-tb-side right">
            {!showingContent && (
              <div className="st-devices" role="group" aria-label="Screen size">
                {DEVICES.map(({ id, title, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={device === id ? "on" : ""}
                    aria-pressed={device === id}
                    title={title}
                    onClick={() => setDevice(id)}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>

        <div className="st-main">
          {(tab === "content" || tab === "photos") && (
            <aside
              className="st-panel left"
              aria-label={RAIL.find((r) => r.id === tab)?.title}
            >
              {tab === "content" && (
                <ContentPanel
                  items={items}
                  kind={contentKind}
                  onKind={setContentKind}
                  onAdd={() => setUploadTick((n) => n + 1)}
                />
              )}
              {tab === "photos" && (
                <PhotosPanel
                  target={selection?.kind === "image" ? selection : null}
                  onPick={(photo) =>
                    selection?.kind === "image" &&
                    setPicker({ key: selection.key, initial: photo })
                  }
                />
              )}
            </aside>
          )}

          {/* Canvas */}
          <section className="st-center" aria-label="Page">
            {/* The page stays loaded under the content log, so coming back keeps its place and selection. */}
            {tab === "gaps" && (
              <div className="st-content">
                <BotGaps groups={botGaps} />
              </div>
            )}
            {tab === "content" && (
              <div className="st-content">
                <Dashboard
                  embedded
                  uploadSignal={uploadTick}
                  categories={categories}
                  items={items}
                  categorizationEnabled={categorizationEnabled}
                  kind={contentKind}
                  heading={
                    contentKind
                      ? (KIND_OPTIONS.find((k) => k.value === contentKind)
                          ?.title ?? "Content")
                      : "All content"
                  }
                  onChanged={() => router.refresh()}
                />
              </div>
            )}
            <div className="st-canvas" hidden={showingContent}>
              <div className="st-frame-wrap">
                <iframe
                  ref={frame}
                  key={frameKey}
                  title="Your site"
                  src={`${iframeBase}&t=${frameKey}`}
                  className={`st-frame ${device}`}
                  style={{
                    width:
                      DEVICES.find((d) => d.id === device)?.width ?? undefined,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Inspector */}
        </div>
        </div>
        {!showingContent && (
          <aside className="st-panel right" aria-label="Selected item">
            {doc ? (
              <div className="st-panel-body st-doc">
                {doc.type === "contentItem" && (
                  <ItemModal
                    key={doc.item._id}
                    inline
                    item={doc.item}
                    categories={categories}
                    categorizationEnabled={categorizationEnabled}
                    onClose={closeDoc}
                    onSaved={docSaved}
                  />
                )}
                {doc.type === "courseGroup" && (
                  <>
                    <div className="st-doc-open">
                      <button
                        type="button"
                        className="st-btn block"
                        onClick={() => post({ type: "open-panel", id: doc.id })}
                      >
                        Show this tile’s panel on the page
                      </button>
                      <p className="st-hint">
                        Opens the sheet that slides up from the tile. Click a
                        course inside it to edit that course here.
                      </p>
                    </div>
                    <CourseGroupModal
                      key={doc.id}
                      inline
                      id={doc.id}
                      initial={doc.fields}
                      onClose={closeDoc}
                      onSaved={docSaved}
                    />
                  </>
                )}
                {doc.type === "publication" && (
                  <PublicationModal
                    key={doc.id}
                    inline
                    id={doc.id}
                    logo={doc.logo}
                    initial={doc.fields}
                    onClose={closeDoc}
                    onSaved={docSaved}
                  />
                )}
              </div>
            ) : selection ? (
              <Inspector
                key={selection.key}
                selection={selection}
                slotOf={slotOf}
                onTyping={(key, value) =>
                  post({ type: "set-text", key, value })
                }
                onCommit={commitText}
                onPhoto={(key) => setPicker({ key, initial: null })}
                onAlt={(key, alt) =>
                  run(
                    () => saveAlt(currentId, key, alt, photoLabel(key)),
                    "Saved to your draft",
                    () => {
                      if (key === selection.key)
                        post({ type: "set-image", key, alt });
                    },
                  )
                }
                onFind={(key) => post({ type: "focus", key })}
              />
            ) : (
              <div className="st-empty">
                {noLink && !linked && (
                  <p className="st-empty-warn" role="alert">
                    This page isn’t connected to the editor, so nothing on it can
                    be selected. The editor is trying to load{" "}
                    <strong>{siteOrigin}</strong>. If that isn’t the website you
                    expect, fix SITE_URL. Otherwise the website needs the latest deploy, and its
                    DASHBOARD_ORIGIN must be this dashboard’s address. If you
                    clicked a link inside the page, pick the page again from the
                    menu at the top.
                  </p>
                )}
                <p className="st-empty-title">Select something on the page</p>
                <p>Click any text to type over it, or a photo to swap it.</p>
                <p>
                  <span className="st-swatch blue" /> Page text and photos.
                  Changes stay a draft until you <strong>Publish</strong>.
                </p>
                <p>
                  <span className="st-swatch purple" /> Awards, press, courses
                  and logos come from your content log. Their details open here
                  and save straight away.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>

      {pickerSlot && picker && (
        <PhotoPicker
          slot={pickerSlot}
          initial={picker.initial}
          onClose={() => setPicker(null)}
          onUse={(photo, focus, alt) =>
            applyPhoto(pickerSlot._key, photo, focus, alt)
          }
        />
      )}

      {confirmDiscard && (
        <ModalShell
          title="Discard changes?"
          subtitle={`Your unpublished changes on ${current.title} will be thrown away. The live page isn’t affected.`}
          onClose={() => setConfirmDiscard(false)}
        >
          <div className="modal-foot">
            <span />
            <div className="modal-foot-actions">
              <button
                type="button"
                className="st-btn ghost"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="st-btn primary"
                onClick={() => {
                  setConfirmDiscard(false);
                  run(
                    () => discardDraft(currentId),
                    "Changes discarded",
                    reloadFrame,
                  );
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Title bar */

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  return (
    <div className="st-menu-anchor" ref={ref}>
      <button
        type="button"
        className="st-title"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Aimee Pugh Bernard
        <ChevronDownIcon size={12} />
      </button>
      {open && (
        <div className="st-menu" role="menu">
          <Link className="st-menu-item" href="/questionnaire" role="menuitem">
            Voice &amp; Tone Questionnaire
          </Link>
          <form action={logout}>
            <button type="submit" className="st-menu-item" role="menuitem">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function PageSwitcher({
  pages,
  current,
}: {
  pages: PageTab[];
  current: PageTab;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  return (
    <div className="st-menu-anchor" ref={ref}>
      <button
        type="button"
        className="st-page-switch"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <PagePanelIcon size={16} />
        <span>{current.title}</span>
        <ChevronDownIcon size={12} />
      </button>
      {open && (
        <div className="st-menu" role="menu">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={`/site?page=${p.slug}`}
              className={`st-menu-item page ${p.id === current.id ? "current" : ""}`}
              role="menuitem"
              onClick={close}
            >
              <span className="st-menu-name">{p.title}</span>
              <span className="st-menu-route">{p.path}</span>
              {p.id === current.id && <CheckIcon size={13} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Left panels */

function PanelHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="st-panel-header">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function ContentPanel({
  items,
  kind,
  onKind,
  onAdd,
}: {
  items: ContentItem[];
  kind: string | null;
  onKind: (k: string | null) => void;
  onAdd: () => void;
}) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.kind ?? "", (m.get(i.kind ?? "") ?? 0) + 1);
    return m;
  }, [items]);
  return (
    <>
      <PanelHeader title="Content log">
        <button
          type="button"
          className="st-icon-btn"
          aria-label="Add content"
          data-tip="Add content"
          onClick={onAdd}
        >
          <PlusIcon size={16} />
        </button>
      </PanelHeader>
      <div className="st-panel-body">
        <button
          type="button"
          className={`st-row ${kind === null ? "selected" : ""}`}
          onClick={() => onKind(null)}
        >
          <span className="st-row-icon">
            <CmsIcon size={14} />
          </span>
          <span className="st-row-label">All content</span>
          <span className="st-row-meta">{items.length}</span>
        </button>
        {KIND_OPTIONS.map((k) => (
          <button
            key={k.value}
            type="button"
            className={`st-row ${kind === k.value ? "selected" : ""}`}
            onClick={() => onKind(k.value)}
          >
            <span className="st-row-icon">
              <CollectionIcon size={14} />
            </span>
            <span className="st-row-label">{k.title}</span>
            <span className="st-row-meta">{counts.get(k.value) ?? 0}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function PhotosPanel({
  target,
  onPick,
}: {
  target: Selection | null;
  onPick: (photo: Photo) => void;
}) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
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
  };
  return (
    <>
      <PanelHeader title="Photos">
        <label className="st-icon-btn" title="Upload a photo">
          <UploadCloudIcon size={15} />
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
      </PanelHeader>
      <div className="st-panel-body">
        <p className="st-panel-note">
          {busy
            ? "Uploading…"
            : target
              ? "Pick a photo to put in the selected spot."
              : "Select a photo on the page, then pick one here to swap it in."}
        </p>
        {err && <p className="st-error">{err}</p>}
        {!photos ? (
          <p className="st-panel-note">Loading…</p>
        ) : (
          <div className="st-photo-grid">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                className="st-photo"
                title={p.name}
                disabled={!target}
                onClick={() => onPick(p)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(p.url, 240)} alt={p.name} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Inspector */

function FieldLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="st-field-label">
      {icon}
      {children}
    </span>
  );
}

function Inspector({
  selection,
  slotOf,
  onTyping,
  onCommit,
  onPhoto,
  onAlt,
  onFind,
}: {
  selection: Selection;
  slotOf: (key: string) => SlotValue | undefined;
  onTyping: (key: string, value: string) => void;
  onCommit: (key: string, value: string, label: string) => void;
  onPhoto: (key: string) => void;
  onAlt: (key: string, alt: string) => void;
  onFind: (key: string) => void;
}) {
  return (
    <>
      <div className="st-inspector-head">
        <span className="st-inspector-icon">{itemIcon(selection, 16)}</span>
        <div>
          <div className="st-inspector-name">{selection.name}</div>
          <div className="st-inspector-where">{selection.section}</div>
        </div>
        <button
          type="button"
          className="st-icon-btn"
          title="Show it on the page"
          onClick={() => onFind(selection.key)}
        >
          <ExternalIcon size={13} />
        </button>
      </div>
      <div className="st-panel-body st-fields">
        {selection.kind === "image" ? (
          <PhotoFields
            src={selection.src}
            alt={slotOf(selection.key)?.alt ?? selection.alt}
            onChange={() => onPhoto(selection.key)}
            onAlt={(alt) => onAlt(selection.key, alt)}
          />
        ) : (
          <div className="st-field">
            <FieldLabel icon={<TextIcon size={11} />}>Text</FieldLabel>
            <TextField
              value={selection.value}
              onTyping={(v) => onTyping(selection.key, v)}
              onCommit={(v) =>
                onCommit(
                  selection.key,
                  v,
                  `${selection.section} · ${selection.name}`,
                )
              }
            />
          </div>
        )}
        {selection.extras.map((key) => {
          const slot = slotOf(key);
          if (!slot) return null;
          return (
            <div key={key} className="st-group">
              <div className="st-group-title">{slot.label}</div>
              {slot.kind === "image" ? (
                <PhotoFields
                  src={slot.image?.url ? thumb(slot.image.url, 600) : ""}
                  alt={slot.alt ?? ""}
                  onChange={() => onPhoto(key)}
                  onAlt={(alt) => onAlt(key, alt)}
                />
              ) : (
                <div className="st-field">
                  <FieldLabel icon={<TextIcon size={11} />}>Text</FieldLabel>
                  <TextField
                    value={slot.text ?? ""}
                    onCommit={(v) => onCommit(key, v, slot.label)}
                  />
                </div>
              )}
            </div>
          );
        })}
        <p className="st-hint">
          Saves to your draft when you click away. Nothing goes live until you
          Publish.
        </p>
      </div>
    </>
  );
}

/** A text box that grows with its text. Typing on the page updates it too. */
function TextField({
  value,
  onTyping,
  onCommit,
}: {
  value: string;
  onTyping?: (v: string) => void;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [draft]);
  return (
    <textarea
      ref={box}
      className="st-input"
      value={draft}
      rows={1}
      onFocus={() => (focused.current = true)}
      onChange={(e) => {
        setDraft(e.target.value);
        onTyping?.(e.target.value);
      }}
      onBlur={() => {
        focused.current = false;
        if (draft.trim() && draft.trim() !== value.trim()) onCommit(draft);
      }}
    />
  );
}

/** A small "i" that explains a field on hover or keyboard focus. */
function InfoTip({ children }: { children: ReactNode }) {
  const id = useId();
  return (
    <span className="st-info">
      <button
        type="button"
        className="st-info-btn"
        aria-label="Why is this needed?"
        aria-describedby={id}
      >
        <InfoIcon size={12} />
      </button>
      <span role="tooltip" id={id} className="st-info-tip">
        {children}
      </span>
    </span>
  );
}

function PhotoFields({
  src,
  alt,
  onChange,
  onAlt,
}: {
  src: string;
  alt: string;
  onChange: () => void;
  onAlt: (alt: string) => void;
}) {
  const [draft, setDraft] = useState(alt);
  return (
    <>
      <div className="st-field">
        <FieldLabel icon={<ElementImageIcon size={11} />}>Photo</FieldLabel>
        <div className="st-photo-preview">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" />
          ) : (
            <span />
          )}
        </div>
        <button type="button" className="st-btn block" onClick={onChange}>
          Change photo
        </button>
      </div>
      <div className="st-field">
        <FieldLabel icon={<TextIcon size={11} />}>
          Description
          <InfoTip>
            A short sentence saying what’s in the photo. Screen readers read it
            aloud for people who can’t see the photo, it shows if the photo
            fails to load, and search engines use it to understand the page.
          </InfoTip>
        </FieldLabel>
        <textarea
          className="st-input"
          rows={5}
          value={draft}
          placeholder="What’s in the photo (read aloud to people who can’t see it)"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() !== alt.trim() && onAlt(draft)}
        />
      </div>
    </>
  );
}
