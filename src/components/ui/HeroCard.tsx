import * as React from "react";
import { Card } from "./Card";
export function HeroCard({ title, children, actions }: { title: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode; }) {
  return (
    <Card className="p-8 md:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
        {children ? <p className="text-[var(--muted)] mt-3">{children}</p> : null}
        {actions ? <div className="mt-6 flex items-center justify-center gap-3">{actions}</div> : null}
      </div>
    </Card>
  );
}
