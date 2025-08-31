import { Breadcrumbs } from './Breadcrumbs'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="container-page py-6 lg:py-8">
      <div className="space-y-2">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
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
