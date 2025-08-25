import * as React from "react";
export function StatIcon({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="h-10 w-10 rounded-full bg-[color:var(--tint-accent)] text-[color:var(--accent)] flex items-center justify-center">
      <span className="text-base">{children}</span>
    </div>
  );
}
