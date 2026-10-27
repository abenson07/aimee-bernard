"use client";

/* The Site editor, laid out like Stacki (https://github.com/flowtricks/stacki): a title bar with the
   page switcher and Publish, an icon rail with Pages / Navigator / Content / Photos panels, the
   live page in the middle, and on the right whatever is selected on it. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
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
  ChevronRightIcon,
  CmsIcon,
  CollectionIcon,
  DesktopIcon,
  ElementButtonIcon,
  ElementH2Icon,
  ElementImageIcon,
  ElementPIcon,
  ElementSectionIcon,
  ExternalIcon,
  NavigatorIcon,
  PagePanelIcon,
  PhoneIcon,
  TabletIcon,
  TextIcon,
  UploadCloudIcon,
} from "./icons";
import { PhotoPicker, thumb } from "./photo-picker";

type PageTab = { id: string; title: string; slug: string; path: string };
type NavItem = {
  ref: number;
  kind: "text" | "image" | "doc";
  name: string;
  text: string;
  key: string;
};
type NavSection = { name: string; items: NavItem[] };
/** What is selected on the page (text or a photo; Sanity items open a window instead). */
type Selection = {
  ref: number;
  key: string;
  kind: "text" | "image";
  name: string;
  section: string;
  value: string;
  src: string;
  alt: string;
  extras: string[];
};
type RailTab = "pages" | "navigator" | "content" | "photos";

const RAIL: {
  id: RailTab;
  title: string;
  Icon: (p: { size?: number }) => ReactNode;
}[] = [
  { id: "pages", title: "Pages", Icon: PagePanelIcon },
  { id: "navigator", title: "Navigator", Icon: NavigatorIcon },
  { id: "content", title: "Content log", Icon: CmsIcon },
  { id: "photos", title: "Photos", Icon: AssetManagerIcon },
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
  categorizationEnabled,
}: {
  pages: PageTab[];
  currentId: string;
  initial: PageState | null;
  iframeBase: string;
  siteOrigin: string;
  categories: Category[];
  items: ContentItem[];
  categorizationEnabled: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState<PageState | null>(initial);
  const [frameKey, setFrameKey] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<RailTab | null>("navigator");
  const [contentKind, setContentKind] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [sections, setSections] = useState<NavSection[]>([]);
  const [hoverRef, setHoverRef] = useState<number | null>(null);
  const [selRef, setSelRef] = useState<number | null>(null);
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
  const showingContent = tab === "content";

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
    setSelRef(null);
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
      if (d.type === "ready") post({ type: "scroll-to", y: scrollY.current });
      if (d.type === "scroll") scrollY.current = Number(d.y) || 0;
      if (d.type === "structure" && Array.isArray(d.sections))
        setSections(d.sections);
      if (d.type === "hover")
        setHoverRef(typeof d.ref === "number" ? d.ref : null);
      if (d.type === "select") {
        setSelRef(d.ref);
        setSelection({
          ref: d.ref,
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
        setSelRef(null);
        setSelection(null);
      }
      if (d.type === "typing")
        setSelection((s) =>
          s && s.key === d.key ? { ...s, value: String(d.value ?? "") } : s,
        );
      if (d.type === "text")
        commitText(String(d.key), String(d.value ?? ""), String(d.label ?? ""));
      if (d.type === "doc") {
        setSelRef(d.ref);
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

  const closeDoc = () => {
    setDoc(null);
    reloadFrame(); // the lists come from the content log, so show the saved version
    router.refresh();
  };

  const applyPhoto = (
    key: string,
    photo: Photo,
    focus: { x: number; y: number },
    alt: string,
  ) => {
    setPicker(null);
    const onPage = selection?.key === key; // its own photo; a hover photo isn't on the page until hovered
    run(
      () => savePhoto(currentId, key, photo.id, focus, alt),
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
      </header>

      <div className="st-main">
        {/* Icon rail: clicking the open panel's icon folds it away */}
        <nav className="st-rail" aria-label="Panels">
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
              <Icon size={20} />
            </button>
          ))}
        </nav>

        {tab && (
          <aside
            className="st-panel left"
            aria-label={RAIL.find((r) => r.id === tab)?.title}
          >
            {tab === "pages" && (
              <PagesPanel pages={pages} currentId={currentId} />
            )}
            {tab === "navigator" && (
              <NavigatorPanel
                sections={sections}
                selRef={selRef}
                hoverRef={hoverRef}
                onHover={(ref) => post({ type: "hover-ref", ref })}
                onPick={(ref) => post({ type: "select-ref", ref })}
              />
            )}
            {tab === "content" && (
              <ContentPanel
                items={items}
                kind={contentKind}
                onKind={setContentKind}
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
          {showingContent && (
            <div className="st-content">
              <Dashboard
                embedded
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
            <div className="st-toolbar">
              <div className="st-crumbs">
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
            </div>
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
        {!showingContent && (
          <aside className="st-panel right" aria-label="Selected item">
            {selection ? (
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
                    () => saveAlt(currentId, key, alt),
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
                <p className="st-empty-title">Select something on the page</p>
                <p>Click any text to type over it, or a photo to swap it.</p>
                <p>
                  <span className="st-swatch blue" /> Page text and photos.
                  Changes stay a draft until you <strong>Publish</strong>.
                </p>
                <p>
                  <span className="st-swatch purple" /> Awards, press, courses
                  and logos come from your content log. They open in a window
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

      {doc?.type === "contentItem" && (
        <ItemModal
          item={doc.item}
          categories={categories}
          categorizationEnabled={categorizationEnabled}
          onClose={closeDoc}
        />
      )}
      {doc?.type === "courseGroup" && (
        <CourseGroupModal id={doc.id} initial={doc.fields} onClose={closeDoc} />
      )}
      {doc?.type === "publication" && (
        <PublicationModal
          id={doc.id}
          logo={doc.logo}
          initial={doc.fields}
          onClose={closeDoc}
        />
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
          <Link className="st-menu-item" href="/content" role="menuitem">
            Content log (full page)
          </Link>
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

function PagesPanel({
  pages,
  currentId,
}: {
  pages: PageTab[];
  currentId: string;
}) {
  return (
    <>
      <PanelHeader title="Pages" />
      <div className="st-panel-body">
        {pages.map((p) => (
          <Link
            key={p.id}
            href={`/site?page=${p.slug}`}
            className={`st-row ${p.id === currentId ? "selected" : ""}`}
          >
            <span className="st-row-icon">
              <PagePanelIcon size={16} />
            </span>
            <span className="st-row-label">{p.title}</span>
            <span className="st-row-meta">{p.path}</span>
          </Link>
        ))}
        <p className="st-panel-note">
          More pages (Communicator, Immunologist, Contact) come next.
        </p>
      </div>
    </>
  );
}

function NavigatorPanel({
  sections,
  selRef,
  hoverRef,
  onHover,
  onPick,
}: {
  sections: NavSection[];
  selRef: number | null;
  hoverRef: number | null;
  onHover: (ref: number | null) => void;
  onPick: (ref: number) => void;
}) {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const rowRefs = useRef(new Map<number, HTMLButtonElement>());
  // Keep the selected row in view when something is clicked on the page.
  useEffect(() => {
    if (selRef !== null)
      rowRefs.current.get(selRef)?.scrollIntoView({ block: "nearest" });
  }, [selRef]);

  if (!sections.length) {
    return (
      <>
        <PanelHeader title="Navigator" />
        <p className="st-panel-note">Loading the page…</p>
      </>
    );
  }
  return (
    <>
      <PanelHeader title="Navigator" />
      <div className="st-panel-body" onMouseLeave={() => onHover(null)}>
        {sections.map((s, i) => {
          const isClosed = closed.has(s.name);
          return (
            <div key={`${s.name}-${i}`}>
              <button
                type="button"
                className="st-row section"
                aria-expanded={!isClosed}
                onClick={() =>
                  setClosed((c) => {
                    const next = new Set(c);
                    if (next.has(s.name)) next.delete(s.name);
                    else next.add(s.name);
                    return next;
                  })
                }
              >
                <span className={`st-caret ${isClosed ? "" : "open"}`}>
                  <ChevronRightIcon size={11} />
                </span>
                <span className="st-row-icon">
                  <ElementSectionIcon size={14} />
                </span>
                <span className="st-row-label">{s.name}</span>
                <span className="st-row-meta">{s.items.length}</span>
              </button>
              {!isClosed &&
                s.items.map((item) => (
                  <button
                    key={item.ref}
                    ref={(el) => {
                      if (el) rowRefs.current.set(item.ref, el);
                      else rowRefs.current.delete(item.ref);
                    }}
                    type="button"
                    className={`st-row child ${item.kind === "doc" ? "is-doc" : ""} ${selRef === item.ref ? "selected" : ""} ${hoverRef === item.ref ? "hovered" : ""}`}
                    title={item.text}
                    onMouseEnter={() => onHover(item.ref)}
                    onClick={() => onPick(item.ref)}
                  >
                    <span className="st-row-icon">{itemIcon(item)}</span>
                    <span className="st-row-label">{item.name}</span>
                    <span className="st-row-text">{item.text}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ContentPanel({
  items,
  kind,
  onKind,
}: {
  items: ContentItem[];
  kind: string | null;
  onKind: (k: string | null) => void;
}) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.kind ?? "", (m.get(i.kind ?? "") ?? 0) + 1);
    return m;
  }, [items]);
  return (
    <>
      <PanelHeader title="Content log" />
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
        <button
          type="button"
          className="st-photo-preview"
          onClick={onChange}
          title="Change photo"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" />
          ) : (
            <span />
          )}
          <span className="st-photo-change">Change photo</span>
        </button>
      </div>
      <div className="st-field">
        <FieldLabel icon={<TextIcon size={11} />}>Description</FieldLabel>
        <textarea
          className="st-input"
          rows={2}
          value={draft}
          placeholder="What’s in the photo (read aloud to people who can’t see it)"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() !== alt.trim() && onAlt(draft)}
        />
      </div>
    </>
  );
}
