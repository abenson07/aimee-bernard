"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons";

export type Toast = { id: string; message: string };

const LIFE_MS = 5000;
const EXIT_MS = 220;

export function useToasts() {
  const [toasts, setToasts] = useState<(Toast & { leaving?: boolean })[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const existing = timers.current.get(id);
    if (existing) window.clearTimeout(existing);
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, EXIT_MS);
  }, []);

  const push = useCallback(
    (message: string) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      setToasts((current) => [{ id, message }, ...current]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), LIFE_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer);
    };
  }, []);

  return { toasts, push, dismiss };
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: (Toast & { leaving?: boolean })[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={toast.leaving ? "toast is-leaving" : "toast"}
          role="status"
        >
          <p>{toast.message}</p>
          <button
            type="button"
            className="toast-x"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            <CloseIcon size={13} />
          </button>
          <span className="toast-timer" style={{ animationDuration: `${LIFE_MS}ms` }} />
        </div>
      ))}
    </div>
  );
}
