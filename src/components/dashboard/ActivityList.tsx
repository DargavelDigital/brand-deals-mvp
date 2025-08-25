import * as React from "react";
import { Card } from "@/components/ui/Card";

export interface ActivityItem {
  id: string | number;
  title: string;
  timeAgo: string; // e.g., "2 minutes ago"
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-0 overflow-hidden">
      <ul className="divide-y divide-[var(--border)]">
        {items.map((it) => (
          <li key={it.id} className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm">{it.title}</span>
            <span className="text-xs text-[var(--muted)]">{it.timeAgo}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
