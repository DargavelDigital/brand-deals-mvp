import * as React from "react";
import { Card } from "./Card";
export function ActionTile({ icon, label }: { icon: React.ReactNode; label: string; }) {
  return (
    <Card className="p-5 text-center hover:shadow-md transition-standard min-h-[112px] flex flex-col items-center justify-center">
      <div className="mb-2 h-10 w-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)]/80">
        {icon}
      </div>
      <div className="font-medium">{label}</div>
    </Card>
  );
}
