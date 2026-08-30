"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { Category, ContentItem } from "@/lib/types";
import { reviewCategory } from "./actions";
import { CategoryChangeModal } from "./category-change-modal";
import { itemContext } from "./category-suggestion";
import { CloseIcon, SearchIcon } from "./icons";

function LedgerRow({ item, onRequestChange }: { item: ContentItem; onRequestChange: () => void }) {
  const [state, formAction, pending] = useActionState(reviewCategory, undefined);
  const changedFromSuggestion = item.categoryStatus === "changed";

  return (
    <div className="ledger-row" data-flagged={item.categoryFlaggedForReview ? "true" : "false"}>
      <div className="ledger-row-main">
        <div className="ledger-cell ledger-col-title">
          <span className="ledger-item-title">{item.title}</span>
          {itemContext(item) && <span className="ledger-item-context">{itemContext(item)}</span>}
        </div>

        <div className="ledger-cell ledger-col-cat">
          <div className="suggestion-chips">
            <span className="chip">{item.categoryName ?? "Unsorted"}</span>
            {item.categorySecondaryName && <span className="chip chip-outline">{item.categorySecondaryName}</span>}
            {item.categoryFlaggedForReview && <span className="flag-mark">Worth a second look</span>}
          </div>
          {changedFromSuggestion && (
            <span className="ledger-was-suggested">
              AI suggested {item.categorySuggestedName}
              {item.categorySuggestedSecondaryName ? ` + ${item.categorySuggestedSecondaryName}` : ""}
            </span>
          )}
          {(changedFromSuggestion ? item.categoryNote : item.categoryRationale) && (
            <p className="suggestion-rationale">
              {changedFromSuggestion ? item.categoryNote : item.categoryRationale}
            </p>
          )}
        </div>

        <div className="ledger-cell ledger-col-actions">
          <span className="status-note">
            {item.categoryStatus === "pending" && "Pending review"}
            {item.categoryStatus === "confirmed" && "Confirmed"}
            {item.categoryStatus === "changed" && "Changed"}
          </span>
          <div className="ledger-action-buttons">
            <button type="button" className="btn-quiet btn-sm" onClick={onRequestChange}>
              Change
            </button>
            {item.categoryStatus === "pending" && (
              <form action={formAction}>
                <input type="hidden" name="id" value={item._id} />
                <input type="hidden" name="category" value={item.categoryId ?? ""} />
                {item.categorySecondaryId && (
                  <input type="hidden" name="categorySecondary" value={item.categorySecondaryId} />
                )}
                <button type="submit" className="btn-primary btn-sm" disabled={pending}>
                  {pending ? "Saving…" : "Looks right"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryLedgerView({
  items,
  categories,
  onClose,
}: {
  items: ContentItem[];
  categories: Category[];
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [flagOnly, setFlagOnly] = useState(false);
  const [changingItem, setChangingItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !changingItem) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, changingItem]);

  const reviewItems = useMemo(
    () =>
      items
        .filter((item) => item.categorySuggestedId)
        .sort(
          (a, b) =>
            (a.categoryName ?? "").localeCompare(b.categoryName ?? "") || a.title.localeCompare(b.title),
        ),
    [items],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of reviewItems) {
      for (const id of [item.categoryId, item.categorySecondaryId]) {
        if (id) map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, [reviewItems]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviewItems.filter((item) => {
      if (activeCategory && item.categoryId !== activeCategory && item.categorySecondaryId !== activeCategory) {
        return false;
      }
      if (flagOnly && !item.categoryFlaggedForReview) return false;
      if (q) {
        const haystack = `${item.title} ${item.venue ?? ""} ${item.categoryRationale ?? ""} ${
          item.categoryNote ?? ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reviewItems, activeCategory, flagOnly, query]);

  const pendingCount = reviewItems.filter((item) => item.categoryStatus === "pending").length;

  // Keep the modal's copy of the item in sync once a save revalidates the page.
  const liveChangingItem = changingItem
    ? (items.find((item) => item._id === changingItem._id) ?? changingItem)
    : null;

  return (
    <div className="ledger-overlay" role="dialog" aria-modal="true" aria-label="Review categories">
      <div className="ledger-head">
        <div>
          <div className="ledger-title">Review categories</div>
          <div className="ledger-sub">
            {pendingCount === 0
              ? "Everything's been reviewed at least once."
              : `${pendingCount} of ${reviewItems.length} still pending.`}
          </div>
        </div>
        <button type="button" className="x-btn" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      <div className="ledger-body">
        <div className="ledger-chips">
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              className="ledger-chip"
              data-active={activeCategory === category._id ? "true" : "false"}
              onClick={() => setActiveCategory((current) => (current === category._id ? null : category._id))}
            >
              {category.name}
              <span className="count">{counts.get(category._id) ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="ledger-controls">
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search title, venue, or reasoning…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search"
            />
          </label>
          <label className="ledger-toggle">
            <input type="checkbox" checked={flagOnly} onChange={(event) => setFlagOnly(event.target.checked)} />
            Flagged only
          </label>
          <span className="ledger-count">
            {visible.length} of {reviewItems.length}
          </span>
        </div>

        <div className="ledger-table">
          <div className="ledger-row-head">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
          </div>
          {visible.map((item) => (
            <LedgerRow key={item._id} item={item} onRequestChange={() => setChangingItem(item)} />
          ))}
          {visible.length === 0 && <p className="log-empty">Nothing matches that filter.</p>}
        </div>
      </div>

      {liveChangingItem && (
        <CategoryChangeModal
          item={liveChangingItem}
          categories={categories}
          onClose={() => setChangingItem(null)}
        />
      )}
    </div>
  );
}
