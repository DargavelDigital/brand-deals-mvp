import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex items-center gap-2 text-sm text-[var(--muted)]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-[var(--muted)]">/</span>
            )}
            {item.href ? (
              <Link 
                href={item.href}
                className="hover:text-[var(--text)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--muted)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
