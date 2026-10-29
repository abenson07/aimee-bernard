"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  inline = false,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  /** Sit in the page (a side panel) instead of floating over it. */
  inline?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inline) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, inline]);

  useEffect(() => {
    if (inline) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [inline]);

  const head = (
    <div className="modal-head">
      <div>
        <div className="modal-title">{title}</div>
        <div className="modal-sub">{subtitle}</div>
      </div>
      <button type="button" className="x-btn" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </div>
  );

  if (inline) {
    return (
      <div className="modal modal-inline" role="region" aria-label={title}>
        {head}
        {children}
      </div>
    );
  }

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" ref={panelRef} role="dialog" aria-modal="true" aria-label={title}>
        {head}
        {children}
      </div>
    </div>
  );
}
