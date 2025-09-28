"use client";

import * as React from "react";

type PageShellProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Minimal page shell used by Tools/CRM/Inbox pages.
 * - Intentionally lightweight to avoid coupling.
 * - Safe to keep in all environments.
 */
export function PageShell({
  title,
  subtitle,
  actions,
  children,
  className,
  containerClassName,
}: PageShellProps) {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-4 py-6 md:px-6", containerClassName)}>
      {(title || actions) && (
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className={cx("min-h-[40vh]", className)}>{children}</div>
    </div>
  );
}

export default PageShell;
