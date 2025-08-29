import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Console</h1>
        <nav className="space-x-4 text-sm">
          <Link href="/admin">Workspaces</Link>
          <Link href="/admin/errors">Errors</Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
