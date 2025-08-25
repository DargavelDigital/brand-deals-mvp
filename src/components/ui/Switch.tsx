import * as React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: string;
}

export function Switch({ checked = false, onCheckedChange, label, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border border-[var(--border)] bg-[color:var(--surface)] transition-standard ${className}`}
      {...props}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[color:var(--accent)] transition-standard ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </button>
  );
}
