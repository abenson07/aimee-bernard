"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { PlusIcon, SearchIcon } from "../icons";
import { UploadModal } from "../upload-modal";

export function ContentLinkControl({
  value,
  onChange,
  contentItems,
  categories,
  categorizationEnabled,
}: {
  value?: string;
  onChange: (value: string) => void;
  contentItems: { _id: string; title: string; venue?: string }[];
  categories: Category[];
  categorizationEnabled: boolean;
}) {
  const [query, setQuery] = useState(value ?? "");
  const [items, setItems] = useState(contentItems);
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const matches = (
    query.trim()
      ? items.filter((item) => {
          const q = query.trim().toLowerCase();
          return item.title.toLowerCase().includes(q) || (item.venue ?? "").toLowerCase().includes(q);
        })
      : items
  ).slice(0, 8);

  const select = (title: string) => {
    onChange(title);
    setQuery(title);
    setOpen(false);
  };

  return (
    <div className="content-link">
      <label className="search">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search your uploaded content…"
        />
      </label>

      {open && (
        <div className="content-link-dropdown">
          {matches.map((item) => (
            <button
              type="button"
              key={item._id}
              className="content-link-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item.title)}
            >
              {item.title}
            </button>
          ))}
          <button
            type="button"
            className="content-link-option content-link-add"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowUpload(true)}
          >
            <PlusIcon />
            Add new content
          </button>
        </div>
      )}

      {showUpload && (
        <UploadModal
          categories={categories}
          lockedCategoryId={null}
          categorizationEnabled={categorizationEnabled}
          onClose={() => setShowUpload(false)}
          onCreated={(title) => {
            if (title) {
              setItems((prev) => [{ _id: `new-${Date.now()}`, title }, ...prev]);
              select(title);
            }
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
