import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: Props) {
  return (
    <div 
      className={cn(
        "rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm",
        className
      )} 
      {...props} 
    />
  );
}
