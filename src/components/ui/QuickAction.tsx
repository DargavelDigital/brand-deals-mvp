import { ReactNode } from 'react'

export default function QuickAction({ 
  label, 
  icon, 
  onClick 
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
}) {
  return (
    <button 
      onClick={onClick} 
      className="card w-full p-4 hover:bg-[var(--muted)] transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full grid place-items-center bg-[var(--brand-600)]/10 text-[var(--brand-600)]">
          {icon}
        </div>
        <div className="font-medium">{label}</div>
      </div>
    </button>
  )
}
