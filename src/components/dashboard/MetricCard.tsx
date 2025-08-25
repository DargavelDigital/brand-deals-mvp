import * as React from "react";
import { Card } from "@/components/ui/Card";
import { StatIcon } from "@/components/ui/StatIcon";
import { Badge } from "@/components/ui/Badge";

interface Badge {
  text: string
  tone: 'positive' | 'neutral' | 'negative'
}

interface MetricCardProps {
  label: string
  value: string | number
  delta?: {
    value: string | number
    isPositive: boolean
  }
  badge?: Badge
  icon?: React.ReactNode
  className?: string
}

export default function MetricCard({ 
  label, 
  value, 
  delta, 
  badge, 
  icon 
}: MetricCardProps) {
  const deltaClass =
    delta?.isPositive
      ? "text-success border-success/30 bg-success/10"
      : delta && !delta.isPositive
      ? "text-error border-error/30 bg-error/10"
      : "text-[var(--muted)] border-[var(--border)] bg-[color:var(--muted)]/10";

  return (
    <Card className="p-6 min-h-[120px]">
      <div className="flex items-start gap-4">
        {icon ? <StatIcon>{icon}</StatIcon> : null}
        <div className="flex-1">
          <div className="text-sm text-[var(--muted)]">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        {delta ? <Badge className={deltaClass}>{delta.isPositive ? '+' : ''}{delta.value}</Badge> : null}
      </div>
    </Card>
  );
}
