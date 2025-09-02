import React from 'react';

interface MPSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export default function MPSection({ title, children, className = '', subtitle }: MPSectionProps) {
  return (
    <section className={`space-y-4 md:space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--fg)]">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[var(--muted)]">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
