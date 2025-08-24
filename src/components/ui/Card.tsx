import { cn } from '@/lib/utils' // if you don't have cn, replace with simple join

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('card p-5', className)}>{children}</div>
}
