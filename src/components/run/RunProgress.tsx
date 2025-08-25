'use client';

import * as React from "react";
import { Card } from "@/components/ui/Card";

interface Props {
  current: number;
  total: number;
  label?: string;
}

export default function RunProgress({ current, total, label }: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <Card className="p-4">
      <div className="space-y-2">
        {label && <div className="text-sm font-medium">{label}</div>}
        <div className="relative">
          <div className="h-2 w-full rounded-full bg-[color:var(--muted)]/15">
            <div 
              className="h-2 rounded-full bg-[color:var(--accent)] transition-standard"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-[var(--muted)] flex justify-between">
          <span>{current} of {total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      </div>
    </Card>
  );
}
