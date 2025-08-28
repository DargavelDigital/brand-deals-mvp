import { Button } from '@/components/ui/Button'
import { Inbox } from 'lucide-react'

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action 
}: { 
  icon?: any
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-2xl border-[var(--border)] bg-[var(--card)]">
      <Icon className="h-12 w-12 text-[var(--muted-fg)] mb-4" />
      <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-fg)] mt-2 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
