import * as React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement, Props>(function Input({ className="", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${className}`}
      {...props}
    />
  );
});
