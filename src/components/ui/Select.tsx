import * as React from "react";
type Props = React.SelectHTMLAttributes<HTMLSelectElement>;
export function Select({ className="", children, ...props }: Props) {
  return (
    <select
      className={`h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
