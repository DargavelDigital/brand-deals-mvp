import * as React from "react";
type Props = React.HTMLAttributes<HTMLSpanElement>;
export function Badge({ className="", ...props }: Props) {
  return <span className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[color:var(--surface)] px-2.5 py-0.5 text-xs text-[var(--muted)] ${className}`} {...props} />;
}
