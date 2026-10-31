"use client";

import { useActionState } from "react";
import type { BotGapItem } from "@/lib/bot-gaps";
import { updateBotContent } from "../actions";

type Group = { kind: string; title: string; total: number; items: BotGapItem[] };

const ISSUE_LABEL = {
  empty: "No description",
  thin: "Description too short",
  "written-by": "Description is just a byline",
} as const;

function GapRow({ item }: { item: BotGapItem }) {
  const [state, action, pending] = useActionState(updateBotContent, undefined);
  const missingLink = item.missing.includes("link");

  return (
    <form action={action} className="field" style={{ padding: "16px 24px", gap: 10, borderTop: "1px solid var(--border)" }}>
      <input type="hidden" name="id" value={item._id} />
      <div>
        <strong>{item.title || "Untitled"}</strong>
        <span className="muted">
          {[item.venue, item.date].filter(Boolean).map((part) => ` · ${part}`)}
        </span>
      </div>
      <div className="muted" style={{ fontSize: 13 }}>
        Missing: {missingLink && "link"}
        {missingLink && item.descriptionIssue && ", "}
        {item.descriptionIssue && ISSUE_LABEL[item.descriptionIssue].toLowerCase()}
      </div>
      <label className="field">
        <span className="label">Link</span>
        <input
          className="input"
          name="url"
          type="text"
          defaultValue={item.href ?? ""}
          placeholder="https://"
        />
      </label>
      <label className="field">
        <span className="label">Description</span>
        <textarea className="input" name="description" defaultValue={item.description ?? ""} rows={3} />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" className="btn-primary btn-sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.error && <span className="form-error">{state.error}</span>}
        {state?.ok && <span className="muted">Saved. It leaves this list on refresh once it&apos;s complete.</span>}
      </div>
    </form>
  );
}

export function BotGaps({ groups }: { groups: Group[] }) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="page page-embedded">
        <p className="muted">
          {total} {total === 1 ? "item" : "items"} the &ldquo;Ask me a Q?&rdquo; bot answers poorly: no link, no description, a
          description under 40 characters, or one that starts &ldquo;Written by&rdquo;.
        </p>
        {groups.map((group) => (
          <section key={group.kind} className="log">
            <div className="log-head">
              <div className="log-title">
                <h2>{group.title}</h2>
                <span className="log-count">
                  {group.items.length} of {group.total} need work
                </span>
              </div>
            </div>
            {group.items.length === 0 ? (
              <p className="log-empty">Nothing missing here.</p>
            ) : (
              group.items.map((item) => <GapRow key={item._id} item={item} />)
            )}
          </section>
        ))}
    </div>
  );
}
