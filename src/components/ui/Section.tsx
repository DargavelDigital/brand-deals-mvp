import * as React from "react";
interface Props { title?: string; description?: string; className?: string; children: React.ReactNode; }
export function Section({ title, description, className = "", children }: Props) {
  return (
    <section className={`container-1200 ${className}`}>
      {title ? (
        <header className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          {description ? <p className="text-[var(--muted)] mt-1 text-sm">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
