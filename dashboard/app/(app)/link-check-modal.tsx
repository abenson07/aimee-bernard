"use client";

import { useEffect, useRef, useState } from "react";
import { checkLinks, replaceLink, setItemHidden } from "./actions";
import { ModalShell } from "./modal-shell";
import type { BrokenLink } from "@/lib/link-check";

type RowState = { status: "open" | "saving" | "fixed" | "hidden"; error?: string; url: string };
const rowId = (link: BrokenLink) => `${link.itemId}:${link.linkKey ?? "main"}`;

/** Lists every link that doesn't load. Each fix saves the moment she makes it, so closing the window loses nothing. */
export function LinkCheckModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"checking" | "done" | "failed">("checking");
  const [links, setLinks] = useState<BrokenLink[]>([]);
  const [checked, setChecked] = useState(0);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    checkLinks().then((res) => {
      if (res.error || !res.broken) return setPhase("failed");
      setLinks(res.broken);
      setChecked(res.checked ?? 0);
      setRows(Object.fromEntries(res.broken.map((l) => [rowId(l), { status: "open", url: l.url } as RowState])));
      setPhase("done");
    });
  }, []);

  const patch = (id: string, next: Partial<RowState>) => setRows((r) => ({ ...r, [id]: { ...r[id], ...next } }));

  async function save(link: BrokenLink) {
    const id = rowId(link);
    patch(id, { status: "saving", error: undefined });
    const res = await replaceLink(link.itemId, link.linkKey, rows[id].url);
    if (res.error) patch(id, { status: "open", error: res.error });
    else patch(id, { status: "fixed", url: res.url ?? rows[id].url });
  }

  async function hide(link: BrokenLink, hidden: boolean) {
    const id = rowId(link);
    patch(id, { status: "saving", error: undefined });
    const res = await setItemHidden(link.itemId, hidden);
    patch(id, res.error ? { status: hidden ? "open" : "hidden", error: res.error } : { status: hidden ? "hidden" : "open" });
  }

  const remaining = links.filter((l) => rows[rowId(l)]?.status === "open" || rows[rowId(l)]?.status === "saving").length;

  return (
    <ModalShell
      title="Check links"
      subtitle={
        phase === "checking"
          ? "Checking every link. This takes a few seconds…"
          : phase === "failed"
            ? "The check didn't run."
            : links.length === 0
              ? `All ${checked} links work.`
              : `${links.length} of ${checked} links didn't load. Fixes save as you go, so you can close this any time.`
      }
      onClose={onClose}
    >
      <div className="modal-body">
        {phase === "failed" && <p className="muted">Something went wrong. Close this and try again.</p>}
        {phase === "done" && links.length > 0 && remaining === 0 && <p>All done. Nothing left to fix.</p>}
        {links.map((link) => {
          const id = rowId(link);
          const row = rows[id];
          if (!row) return null;
          const busy = row.status === "saving";
          return (
            <div key={id} className="field" style={{ borderBottom: "1px solid var(--border-soft)", paddingBottom: 16 }}>
              <strong>{link.title}</strong>
              <span className="muted">{[link.venue, link.reason].filter(Boolean).join(" · ")}</span>
              {row.status === "hidden" ? (
                <p>
                  Hidden from the website.{" "}
                  <button type="button" className="btn-quiet" disabled={busy} onClick={() => hide(link, false)}>Undo</button>
                </p>
              ) : row.status === "fixed" ? (
                <p>Saved. <a href={row.url} target="_blank" rel="noreferrer">Open it to check</a></p>
              ) : (
                <>
                  <input
                    type="url"
                    value={row.url}
                    disabled={busy}
                    onChange={(e) => patch(id, { url: e.target.value })}
                    aria-label={`New link for ${link.title}`}
                  />
                  {row.error && <span role="alert" style={{ color: "var(--danger, #b3261e)" }}>{row.error}</span>}
                  <div className="modal-foot-actions">
                    <button type="button" className="btn-primary" disabled={busy || !row.url.trim() || row.url === link.url} onClick={() => save(link)}>
                      {busy ? "Saving…" : "Save new link"}
                    </button>
                    <button type="button" className="btn-secondary" disabled={busy} onClick={() => hide(link, true)}>
                      Hide from site
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="modal-foot">
        <span />
        <div className="modal-foot-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>{remaining > 0 ? "Close, finish later" : "Close"}</button>
        </div>
      </div>
    </ModalShell>
  );
}
