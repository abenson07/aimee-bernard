import type { ContentItem } from "@/lib/types";

function humanizeKind(kind: string): string {
  const spaced = kind.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** "Talk · TEDxCU · April 2026" — enough to place an item without opening it,
 *  since a few titles repeat and are only told apart by venue. */
export function itemContext(item: ContentItem): string {
  const parts = [item.kind ? humanizeKind(item.kind) : null, item.venue, item.date].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  return parts.join(" · ");
}

export function CategorySuggestion({ item }: { item: ContentItem }) {
  if (!item.categorySuggestedName) return null;

  return (
    <div className="suggestion-panel">
      <div className="suggestion-chips">
        <span className="chip">{item.categorySuggestedName}</span>
        {item.categorySuggestedSecondaryName && (
          <span className="chip chip-outline">{item.categorySuggestedSecondaryName}</span>
        )}
        {item.categoryFlaggedForReview && <span className="flag-mark">Worth a second look</span>}
      </div>
      {item.categoryRationale && <p className="suggestion-rationale">{item.categoryRationale}</p>}
    </div>
  );
}
