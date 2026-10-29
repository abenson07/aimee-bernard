import { KIND_OPTIONS, type DuplicateMatch } from "@/lib/types";

function describe(match: DuplicateMatch): string {
  const kind = KIND_OPTIONS.find((option) => option.value === match.kind)?.title;
  return [kind, match.venue, match.date].filter(Boolean).join(" · ");
}

/** Shown in place of the modal footer when the title matches something that
 *  is already saved. Nothing has been saved yet at this point. */
export function DuplicateWarning({
  matches,
  confirmLabel,
  pendingLabel,
  pending,
  onConfirm,
  onBack,
}: {
  matches: DuplicateMatch[];
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="modal-foot confirm-delete">
      <p className="confirm-delete-text">You already have something with this title:</p>
      <ul className="duplicate-list">
        {matches.map((match) => (
          <li key={match._id}>
            <strong>{match.title}</strong>
            {describe(match) && <span className="suggestion-rationale">{describe(match)}</span>}
          </li>
        ))}
      </ul>
      <div className="confirm-delete-actions">
        <button type="button" className="btn-quiet" onClick={onBack} disabled={pending}>
          Go back
        </button>
        <button type="button" className="btn-primary" onClick={onConfirm} disabled={pending}>
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </div>
  );
}
