export function ProgressBeacon({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]"></span>
      </span>
      {label && <span>{label}</span>}
    </div>
  )
}
