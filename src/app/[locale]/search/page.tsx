import { Suspense } from 'react'
import { notFound } from 'next/navigation'

export default function SearchPage({ searchParams }: { searchParams: { query?: string } }){
  const q = (searchParams?.query||'').trim()
  if (!q) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-[var(--muted-fg)]">
          Type in the search bar to find brands, contacts, or deals across your workspace.
        </p>
      </div>
      <div className="p-6">Type in the search bar to find brands, contacts, or deals.</div>
    </div>
  )
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search Results</h1>
        <p className="text-[var(--muted-fg)]">
          Results for "{q}" across your workspace.
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        {/* In a follow-up we can federate real queries; for now link to known sections */}
        <div className="grid md:grid-cols-3 gap-4">
          <a className="card p-4" href={`/${locale}/contacts?query=${encodeURIComponent(q)}`}>Search Contacts</a>
          <a className="card p-4" href={`/${locale}/crm?query=${encodeURIComponent(q)}`}>Search Deals</a>
          <a className="card p-4" href={`/${locale}/brand-run?query=${encodeURIComponent(q)}`}>Search Brand Run</a>
        </div>
      </div>
    </div>
  )
}
