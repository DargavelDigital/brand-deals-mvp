'use client'
import { useState } from 'react'
import { advance } from '@/services/brand-run/api'
import * as L from 'lucide-react'

function Section({ title, children }:{ title:string; children:React.ReactNode }){
  return (
    <div className="card p-4 w-full max-w-full">
      <div className="text-lg font-semibold mb-1">{title}</div>
      <div className="text-sm text-[var(--muted-fg)] mb-4">Auto-saved as you go</div>
      {children}
    </div>
  )
}

function Pill({ children }:{ children:React.ReactNode }){
  return <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[11px] text-[var(--muted-fg)]">{children}</span>
}

export function ConnectStep(){
  return (
    <Section title="Connect Accounts">
      <div className="flex items-center gap-2 mb-3">
        <Pill>Auto-saved</Pill>
      </div>

      <p className="text-sm text-[var(--muted-fg)] mb-4">
        Connect your social profiles so we can analyze your content and audience for better brand matches.
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <a href="/tools/connect" className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[var(--brand-600)] text-white shadow-sm hover:opacity-95">
          <L.Plug2 className="w-4 h-4" />
          Open Connect
        </a>

        <details className="text-sm text-[var(--muted-fg)]">
          <summary className="cursor-pointer list-none hover:underline">Supported platforms</summary>
          <div className="mt-2 flex flex-wrap gap-3">
            <span>Instagram</span><span>TikTok</span><span>YouTube</span><span>X (Twitter)</span><span>Facebook</span><span>LinkedIn</span>
          </div>
        </details>
      </div>
    </Section>
  )
}

export function AuditStep(){
  const [pending, setP] = useState(false)
  return (
    <Section title="AI Audit">
      <p className="mb-4 text-sm">Run the AI audit to extract insights from your connected accounts.</p>
      <div className="flex gap-2">
        <button onClick={async()=>{ setP(true); await fetch('/api/audit/run', { method:'POST' }).catch(()=>{}); setP(false) }} className="h-10 px-4 rounded-md border">Run Audit</button>
        <button onClick={async()=>{ await advance('MATCHES'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Matches</button>
      </div>
    </Section>
  )
}

export function MatchesStep(){
  return (
    <Section title="Brand Matches">
      <p className="mb-4 text-sm">Review AI-suggested brands (demo fallback if service unavailable).</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {[ 'Acme', 'Glow Co', 'Peak Labs', 'Nimbus', 'Orbit', 'Alto' ].map(b=>(
          <div key={b} className="card p-4">
            <div className="font-medium">{b}</div>
            <div className="text-xs text-[var(--muted-fg)]">High affinity</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button onClick={async()=>{ await advance('APPROVE'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Approve</button>
      </div>
    </Section>
  )
}

export function ApproveStep(){
  return (
    <Section title="Approve Brands">
      <p className="mb-4 text-sm">Select the brands you want to pursue.</p>
      <div className="mb-3 text-sm">Selection saved automatically.</div>
      <button onClick={async()=>{ await advance('PACK'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Media Pack</button>
    </Section>
  )
}

export function PackStep(){
  return (
    <Section title="Media Pack">
      <p className="mb-4 text-sm">Generate a tailored media pack.</p>
      <div className="flex gap-2">
        <button onClick={async()=>{ await fetch('/api/media-pack/generate', { method:'POST' }).catch(()=>{}) }} className="h-10 px-4 rounded-md border">Generate Pack</button>
        <button onClick={async()=>{ await advance('CONTACTS'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Contacts</button>
      </div>
    </Section>
  )
}

export function ContactsStep(){
  return (
    <Section title="Discover Contacts">
      <p className="mb-4 text-sm">Find decision makers for your approved brands.</p>
      <div className="flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href="/tools/contacts">Open Contact Finder</a>
        <button onClick={async()=>{ await advance('OUTREACH'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Outreach</button>
      </div>
    </Section>
  )
}

export function OutreachStep(){
  return (
    <Section title="Start Outreach">
      <p className="mb-4 text-sm">Kick off a 3–4 touch email sequence with safe defaults.</p>
      <div className="flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href="/tools/outreach">Open Outreach</a>
        <button onClick={async()=>{ await advance('COMPLETE'); location.href='/brand-run' }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Mark Complete</button>
      </div>
    </Section>
  )
}

export function CompleteStep(){
  return (
    <Section title="All Done">
      <p className="text-sm">Great work! You can re-run any individual step from Tools or start a fresh Brand Run anytime.</p>
      <div className="mt-3 flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href="/dashboard">Go to Dashboard</a>
        <a className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white inline-flex items-center" href="/tools">Open Tools</a>
      </div>
    </Section>
  )
}
