"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { humanizeTime, useNow } from "@/lib/time";
import type { Category, ContentItem } from "@/lib/types";
import { ChevronRightIcon, MoreVerticalIcon, PlusIcon, SearchIcon } from "./icons";
import { UploadModal } from "./upload-modal";
import { QuizModal } from "./quiz-modal";
import { ItemModal } from "./item-modal";
import { CategoryLedgerView } from "./category-ledger";
import { LinkCheckModal } from "./link-check-modal";

type Modal =
  | { kind: "upload"; categoryId: string | null }
  | { kind: "quiz"; category: Category }
  | { kind: "item"; item: ContentItem }
  | { kind: "review" }
  | { kind: "links" }
  | null;

/** The three-dot button at the end of the Site editor's content toolbar. Holds the less-used actions. */
function MoreMenu({ onCheckLinks }: { onCheckLinks: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: globalThis.MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="st-menu-anchor" ref={ref}>
      <button
        type="button"
        className="st-icon-btn"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreVerticalIcon size={16} />
      </button>
      {open && (
        <div className="st-menu right" role="menu">
          <button
            type="button"
            className="st-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCheckLinks();
            }}
          >
            Check links
          </button>
        </div>
      )}
    </div>
  );
}

/** "27 minutes ago", with the exact date and time on hover; a week or older shows the date itself. */
function UpdatedCell({ iso, now }: { iso?: string; now: number }) {
  if (!iso || now === 0) return <span className="cell cell-updated">—</span>;
  const { text, exact } = humanizeTime(iso, now);
  return (
    <span className="cell cell-updated" title={exact ?? undefined}>
      <time dateTime={iso}>{text}</time>
    </span>
  );
}

function SourceCell({ item }: { item: ContentItem }) {
  const stop = (event: MouseEvent) => event.stopPropagation();
  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className="wrap-cell" onClick={stop}>
        {item.url}
      </a>
    );
  }
  if (item.fileUrl) {
    return (
      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="wrap-cell" onClick={stop}>
        {item.fileName ?? "File"}
      </a>
    );
  }
  if (item.bodyPreview) {
    return <span className="wrap-cell muted">{item.bodyPreview}</span>;
  }
  return <span className="wrap-cell muted">{item.venue || "—"}</span>;
}

export function Dashboard({
  categories,
  items: allItems,
  categorizationEnabled,
  embedded = false,
  uploadSignal = 0,
  kind = null,
  heading = "Content log",
  onChanged,
}: {
  categories: Category[];
  items: ContentItem[];
  categorizationEnabled: boolean;
  /** Shown inside the Site editor: no page header, and Upload sits beside the search. */
  embedded?: boolean;
  /** Opens the Upload window each time this number goes up (the editor's + button). */
  uploadSignal?: number;
  /** Only items of this kind (the Site editor's Content list picks it). */
  kind?: string | null;
  heading?: string;
  /** Called when a window closes, so the Site editor can fetch the saved items. */
  onChanged?: () => void;
}) {
  const [modal, setModal] = useState<Modal>(null);
  const [query, setQuery] = useState("");
  const now = useNow();
  useEffect(() => {
    if (uploadSignal > 0) setModal({ kind: "upload", categoryId: null });
  }, [uploadSignal]);
  const items = useMemo(() => (kind ? allItems.filter((item) => item.kind === kind) : allItems), [allItems, kind]);

  /* Category still drives the table column, item modal, and the review
     view — just keeping the cards + banner off the main page for now. */
  const showCategoryOverview = false;

  const pendingReview = items.filter(
    (item) => item.categorySuggestedId && !item.categoryReviewedAt,
  ).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.venue ?? "").toLowerCase().includes(q) ||
        (item.categoryName ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const close = () => {
    setModal(null);
    onChanged?.();
  };

  return (
    <>
      <main className={embedded ? "page page-embedded" : "page"}>
        {categorizationEnabled && showCategoryOverview && (
        <div className="cat-grid">
          {categories.map((category) => (
            <div key={category._id} className="cat-card">
              <button
                type="button"
                className="cat-body"
                onClick={() => setModal({ kind: "upload", categoryId: category._id })}
              >
                <span className="cat-head">
                  <span className="cat-name">{category.name}</span>
                  <span className="cat-plus">
                    <PlusIcon />
                  </span>
                </span>
                <span className="cat-count">
                  <span className="cat-num">{category.count}</span>
                  <span className="cat-lbl">uploaded</span>
                </span>
              </button>

              <div className="cat-rule" />

              {category.pending.length > 0 ? (
                <button
                  type="button"
                  className="quiz-strip is-live"
                  onClick={() => setModal({ kind: "quiz", category })}
                >
                  <span className="quiz-dot" />
                  {category.pending.length === 1
                    ? "1 question to answer"
                    : `${category.pending.length} questions to answer`}
                  <span className="quiz-arrow">
                    <ChevronRightIcon />
                  </span>
                </button>
              ) : (
                <div className="quiz-strip is-empty">No questions</div>
              )}
            </div>
          ))}
        </div>
        )}

        {categorizationEnabled && showCategoryOverview && pendingReview > 0 && (
          <button
            type="button"
            className="review-banner"
            onClick={() => setModal({ kind: "review" })}
          >
            <span className="quiz-dot" />
            {pendingReview === 1 ? "1 item ready to review" : `${pendingReview} items ready to review`}
            <span className="quiz-arrow">
              <ChevronRightIcon />
            </span>
          </button>
        )}

        <section className="log">
          <div className={embedded ? "log-head st-toolbar" : "log-head"}>
            <div className="log-title">
              <h2>{heading}</h2>
              <span className="log-count">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <label className={embedded ? "search st-search" : "search"}>
              <SearchIcon />
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search content"
              />
            </label>
            {embedded ? (
              <>
                <MoreMenu onCheckLinks={() => setModal({ kind: "links" })} />
                <button
                  type="button"
                  className="st-btn primary"
                  onClick={() => setModal({ kind: "upload", categoryId: null })}
                >
                  <PlusIcon size={13} />
                  Add content
                </button>
              </>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => setModal({ kind: "links" })}>
                Check links
              </button>
            )}
          </div>

          {visible.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {/* A 6-column grid: Title 3, Source 2, Updated 1 (Title 2 and Category 1 when categories are on). */}
                  <th style={{ width: categorizationEnabled ? "33.333%" : "50%" }}>Title</th>
                  <th style={{ width: "33.333%" }}>Source</th>
                  {categorizationEnabled && <th style={{ width: "16.667%" }}>Category</th>}
                  <th style={{ width: "16.667%" }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item._id}
                    className="row-clickable"
                    tabIndex={0}
                    onClick={() => setModal({ kind: "item", item })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setModal({ kind: "item", item });
                      }
                    }}
                  >
                    <td>
                      <div className="cell cell-stack">
                        <span className="row-title">{item.title}{item.hiddenFromSite && <span className="chip" style={{ marginLeft: 8 }}>Hidden</span>}</span>
                        <span className="row-desc">{item.description || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell">
                        <SourceCell item={item} />
                      </span>
                    </td>
                    {categorizationEnabled && (
                      <td>
                        <span className="cell cell-category">
                          <span className="chip">{item.categoryName ?? "Unsorted"}</span>
                          {item.categoryStatus === "pending" && (
                            <span className="status-note">Pending review</span>
                          )}
                          {item.categoryStatus === "changed" && (
                            <span className="status-note">Changed from suggestion</span>
                          )}
                        </span>
                      </td>
                    )}
                    <td>
                      <UpdatedCell iso={item._updatedAt} now={now} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="log-empty">
              {items.length > 0
                ? `Nothing matches “${query}”.`
                : categorizationEnabled
                  ? "Nothing uploaded yet. Use Upload, or pick a category above."
                  : "Nothing uploaded yet. Use Upload to add your first item."}
            </p>
          )}
        </section>
      </main>

      {modal?.kind === "upload" && (
        <UploadModal
          categories={categories}
          lockedCategoryId={modal.categoryId}
          categorizationEnabled={categorizationEnabled}
          defaultKind={kind}
          onClose={close}
        />
      )}

      {modal?.kind === "quiz" && categorizationEnabled && (
        <QuizModal category={modal.category} onClose={close} />
      )}

      {modal?.kind === "item" && (
        <ItemModal
          item={modal.item}
          categories={categories}
          categorizationEnabled={categorizationEnabled}
          onClose={close}
        />
      )}

      {modal?.kind === "links" && <LinkCheckModal onClose={close} />}

      {modal?.kind === "review" && categorizationEnabled && (
        <CategoryLedgerView items={items} categories={categories} onClose={close} />
      )}
    </>
  );
}
