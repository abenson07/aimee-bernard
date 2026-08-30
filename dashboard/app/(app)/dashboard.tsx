"use client";

import { useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import type { Category, ContentItem } from "@/lib/types";
import { logout } from "./actions";
import { ChevronRightIcon, PlusIcon, SearchIcon, UploadIcon } from "./icons";
import { UploadModal } from "./upload-modal";
import { QuizModal } from "./quiz-modal";
import { ItemModal } from "./item-modal";
import { CategoryLedgerView } from "./category-ledger";

type Modal =
  | { kind: "upload"; categoryId: string | null }
  | { kind: "quiz"; category: Category }
  | { kind: "item"; item: ContentItem }
  | { kind: "review" }
  | null;

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
  items,
  categorizationEnabled,
}: {
  categories: Category[];
  items: ContentItem[];
  categorizationEnabled: boolean;
}) {
  const [modal, setModal] = useState<Modal>(null);
  const [query, setQuery] = useState("");

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
        (item.categoryName ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const close = () => setModal(null);

  return (
    <>
      <header className="topbar">
        <div className="wordmark">Aimee Pugh Bernard</div>
        <div className="topbar-actions">
          <form action={logout}>
            <button type="submit" className="btn-quiet">
              Sign out
            </button>
          </form>
          <Link href="/questionnaire" className="btn-secondary">
            Voice &amp; Tone Questionnaire
          </Link>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setModal({ kind: "upload", categoryId: null })}
          >
            <UploadIcon />
            Upload
          </button>
        </div>
      </header>

      <main className="page">
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
          <div className="log-head">
            <div className="log-title">
              <h2>Content log</h2>
              <span className="log-count">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search content"
              />
            </label>
          </div>

          {visible.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th style={{ width: categorizationEnabled ? "60%" : "80%" }}>Title</th>
                  <th style={{ width: "20%" }}>Source</th>
                  {categorizationEnabled && <th style={{ width: "20%" }}>Category</th>}
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
                        <span className="row-title">{item.title}</span>
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

      {modal?.kind === "review" && categorizationEnabled && (
        <CategoryLedgerView items={items} categories={categories} onClose={close} />
      )}
    </>
  );
}
