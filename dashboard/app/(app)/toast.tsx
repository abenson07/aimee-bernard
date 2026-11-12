"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };

type Toasts = {
  /** Something saved. Fades after a few seconds. */
  success: (message: string) => void;
  /** Something did not save. Stays until she closes it, so it can't be missed. */
  error: (message: string) => void;
};

const ToastContext = createContext<Toasts | null>(null);

const SUCCESS_MS = 5000;

/** Every save, delete and upload reports back through this: a green note when
 *  it worked, a red one (that stays) when it didn't. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      /* The same message twice in a row (a double click) shows once. */
      setItems((current) => [...current.filter((item) => item.message !== message), { id, kind, message }]);
      if (kind === "success") setTimeout(() => dismiss(id), SUCCESS_MS);
    },
    [dismiss],
  );

  const api = useMemo<Toasts>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        {items.map((item) => (
          <div
            key={item.id}
            className={`toast toast-${item.kind}`}
            role={item.kind === "error" ? "alert" : "status"}
          >
            <span className="toast-mark" aria-hidden="true">
              {item.kind === "success" ? "✓" : "!"}
            </span>
            <span className="toast-text">{item.message}</span>
            <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Toasts {
  const toasts = useContext(ToastContext);
  if (!toasts) throw new Error("useToast must be used inside <ToastProvider>.");
  return toasts;
}
