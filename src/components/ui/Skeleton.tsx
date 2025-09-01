import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-[var(--muted)]/20",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

export function ContactSkeleton() {
  return (
    <div className="border border-[var(--border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function DealCardSkeleton() {
  return (
    <div className="border border-[var(--border)] rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
      </div>
      <div className="border-t border-[var(--border)] my-3" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}
