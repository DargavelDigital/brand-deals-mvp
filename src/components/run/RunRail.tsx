'use client';

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTransition } from 'react';
import { advance } from '@/services/brand-run/api';

interface Props {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
  onContinue?: () => void;
  step?: string;
  stats?: any;
}

export default function RunRail({ title, items, onContinue, step, stats }: Props) {
  const [pending, start] = useTransition();
  
  const handleContinue = async () => {
    if (onContinue) {
      onContinue();
    } else {
      start(async () => {
        await advance();
        location.href = '/brand-run';
      });
    }
  };

  return (
    <Card className="p-4 w-full max-w-full">
      <div className="text-sm font-medium mb-2">{title}</div>
      
      <div className="text-sm text-[var(--muted-fg)] space-y-1 mb-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleContinue}
        disabled={pending}
        className="w-full h-10 rounded-md bg-[var(--brand-600)] text-white disabled:opacity-60">
        Continue
      </button>
    </Card>
  );
}
