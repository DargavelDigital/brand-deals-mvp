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
    <Card className="p-4 space-y-3">
      <div className="text-sm font-medium">{title}</div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      
      {onContinue && (
        <Button className="w-full mt-2" onClick={handleContinue}>
          Continue
        </Button>
      )}
    </Card>
  );
}
