import * as React from "react";

type Variant = "default" | "secondary";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: "border-[var(--border)] bg-[color:var(--surface)] text-[var(--muted)]",
  secondary: "border-[var(--border)] bg-[color:var(--muted)]/10 text-[var(--muted-fg)]"
};

export function Badge({ variant = "default", className = "", ...props }: Props) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs";
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return <span className={classes} {...props} />;
}
