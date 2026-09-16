"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, ContentItem } from "@/lib/types";
import { logout } from "./actions";
import {
  ChevronRightIcon,
  FileIcon,
  LinkIcon,
  PlusIcon,
  SearchIcon,
  TextIcon,
  UploadIcon,
} from "./icons";
import { UploadModal } from "./upload-modal";
import { QuizModal } from "./quiz-modal";
import { ItemModal } from "./item-modal";
import { ToastStack, useToasts } from "./toasts";

type Modal =
  | { kind: "upload"; categoryId: string | null }
  | { kind: "quiz"; category: Category }
  | { kind: "item"; item: ContentItem }
  | null;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function sourceLabel(item: ContentItem) {
  if (item.url) return "Link";
  if (item.fileName) return "File";
  return "Content";
}

function sourceIcon(item: ContentItem) {
  if (item.url) return <LinkIcon />;
  if (item.fileName) return <FileIcon />;
  return <TextIcon />;
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
  const [added, setAdded] = useState<ContentItem[]>([]);
  const [removed, setRemoved] = useState<ContentItem[]>([]);
  const toasts = useToasts();
  const router = useRouter();

  useEffect(() => {
    setAdded((current) => current.filter((item) => !items.some((row) => row._id === item._id)));
    setRemoved((current) => current.filter((item) => items.some((row) => row._id === item._id)));
  }, [items]);

  const liveItems = useMemo(() => {
    const removedIds = new Set(removed.map((item) => item._id));
    const extras = added.filter(
      (item) => !items.some((row) => row._id === item._id) && !removedIds.has(item._id),
    );
    return [...extras, ...items.filter((item) => !removedIds.has(item._id))];
  }, [items, added, removed]);

  const liveCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        count:
          category.count +
          added.filter((item) => item.categoryId === category._id).length -
          removed.filter((item) => item.categoryId === category._id).length,
      })),
    [categories, added, removed],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return liveItems;
    return liveItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.categoryName ?? "").toLowerCase().includes(q),
    );
  }, [liveItems, query]);

  const close = () => setModal(null);

  return (
    <>
      <header className="topbar">
        <div className="wordmark">Aimee Bernard</div>
        <div className="topbar-actions">
          <form action={logout}>
            <button type="submit" className="btn-quiet">
              Sign out
            </button>
          </form>
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
        {categorizationEnabled && (
        <div className="cat-grid">
          {liveCategories.map((category) => (
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

        <section className="log">
          <div className="log-head">
            <div className="log-title">
              <h2>Content log</h2>
              <span className="log-count">
                {liveItems.length} {liveItems.length === 1 ? "item" : "items"}
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
                  <th style={{ width: categorizationEnabled ? "46%" : "68%" }}>Title</th>
                  {categorizationEnabled && <th style={{ width: "22%" }}>Category</th>}
                  <th style={{ width: "17%" }}>Type</th>
                  <th style={{ width: "15%" }}>Added</th>
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
                      <span className="cell row-title">{item.title}</span>
                    </td>
                    {categorizationEnabled && (
                      <td>
                        <span className="cell">
                          <span className="chip">{item.categoryName ?? "Unsorted"}</span>
                        </span>
                      </td>
                    )}
                    <td>
                      <span className="cell type-cell">
                        {sourceIcon(item)}
                        {sourceLabel(item)}
                      </span>
                    </td>
                    <td>
                      <span className="cell date-cell">
                        {dateFormat.format(new Date(item._createdAt))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="log-empty">
              {liveItems.length > 0
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
          onCreated={(item) => {
            const categoryName = categories.find((category) => category._id === item.categoryId)?.name;
            setAdded((current) => [
              { ...item, categoryName },
              ...current.filter((row) => row._id !== item._id),
            ]);
            toasts.push(`Uploaded “${item.title}”.`);
            router.refresh();
          }}
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
          onDeleted={(item) => {
            setRemoved((current) =>
              current.some((row) => row._id === item._id) ? current : [item, ...current],
            );
            setAdded((current) => current.filter((row) => row._id !== item._id));
            toasts.push(`Deleted “${item.title}”.`);
            router.refresh();
          }}
        />
      )}

      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </>
  );
}
