import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "neutral" | "warning" | "success";
  className?: string;
};

export function StatusPill({ children, icon, tone = "neutral", className }: Props) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
      : // neutral
        "bg-muted/40 text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        "whitespace-nowrap leading-none",
        toneClasses,
        className
      )}
      aria-live="polite"
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
