"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type UserMenuProps = {
  name?: string;
  initials?: string;
  avatarUrl?: string | null;
  onSignOut?: () => Promise<void> | void;
};

/**
 * Safe, isolated user menu. No global styles. No design tokens changed.
 * Keyboard accessible, click-outside to close, portal not required.
 */
export default function UserMenu({
  name = "John Doe",
  initials = "JD",
  avatarUrl = null,
  onSignOut,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Handle locale routing: default locale (en) has no prefix, others do
  const pathSegments = pathname?.split('/') || [];
  const hasLocalePrefix = pathSegments.length > 1 && ['en', 'es', 'fr'].includes(pathSegments[1]);
  const base = hasLocalePrefix ? `/${pathSegments[1]}` : '';

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
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-sm hover:bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-neutral-700 text-white grid place-items-center text-xs font-semibold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-[var(--text)]">{name}</span>
        <svg
          className={`h-4 w-4 text-[var(--muted-fg)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-[var(--text)]">{name}</p>
          </div>
          <div className="my-1 h-px bg-[var(--border)]" />
          <MenuItem href={`${base}/profile`} text="Profile" onSelect={() => setOpen(false)} />
          <MenuItem href={`${base}/settings`} text="Settings" onSelect={() => setOpen(false)} />
          <MenuItem href={`${base}/settings/billing`} text="Billing" onSelect={() => setOpen(false)} />
          <MenuItem href={`${base}/tools/connect`} text="Connected Accounts" onSelect={() => setOpen(false)} />
          <div className="my-1 h-px bg-[var(--border)]" />
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              if (onSignOut) await onSignOut();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-[var(--surface)] focus:outline-none focus:bg-[var(--surface)]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  text,
  onSelect,
}: {
  href: string;
  text: string;
  onSelect?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block rounded-lg px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)] focus:bg-[var(--surface)] focus:outline-none"
      onClick={onSelect}
    >
      {text}
    </Link>
  );
}
