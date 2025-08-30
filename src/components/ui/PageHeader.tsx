interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="container-page py-6 lg:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[var(--muted-fg)] text-lg">{subtitle}</p>
        )}
        {children && (
          <div className="pt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
