import { Suspense } from 'react'
import { notFound } from 'next/navigation'

export default function SearchPage({ searchParams }: { searchParams: { query?: string } }){
  const q = (searchParams?.query||'').trim()
  if (!q) return <div className="p-6">Type in the search bar to find brands, contacts, or deals.</div>
  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-[var(--muted)]">Results for "{q}"</div>
      {/* In a follow-up we can federate real queries; for now link to known sections */}
      <div className="grid md:grid-cols-3 gap-4">
        <a className="card p-4" href={`/contacts?query=${encodeURIComponent(q)}`}>Search Contacts</a>
        <a className="card p-4" href={`/crm?query=${encodeURIComponent(q)}`}>Search Deals</a>
        <a className="card p-4" href={`/brand-run?query=${encodeURIComponent(q)}`}>Search Brand Run</a>
      </div>
    </div>
  )
}
