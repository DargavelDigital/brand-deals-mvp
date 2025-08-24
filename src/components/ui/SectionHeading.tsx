export default function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--muted-fg)] mt-1">{subtitle}</p>}
    </div>
  )
}
