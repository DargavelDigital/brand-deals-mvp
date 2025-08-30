"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  count?: number;
};

export default function NotificationsBell({ count = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Notifications"
        onClick={() => setOpen((s) => !s)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm hover:bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      >
        {/* bell icon */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.172V11a6 6 0 10-12 0v3.172a2 2 0 01-.6 1.428L4 17h11z"/>
          <path d="M9 17a3 3 0 006 0"/>
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg"
          role="dialog"
          aria-label="Notifications"
        >
          <p className="text-sm font-medium text-[var(--text)] mb-1">Notifications</p>
          <div className="my-1 h-px bg-[var(--border)]" />
          <div className="text-sm text-[var(--muted-fg)] py-6 text-center">
            You're all caught up.
          </div>
          {/* If you have a notifications feed later, render it here. */}
        </div>
      )}
    </div>
  );
}
