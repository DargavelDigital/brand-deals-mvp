'use client'
import { useState } from 'react'
import { advance } from '@/services/brand-run/api'
import ConnectCardNew from '@/components/run/connect/ConnectCardNew'
import type { PlatformId } from '@/config/platforms'
import { useLocale } from 'next-intl'

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

export function ConnectStep({ connections }: { connections?: PlatformId[] }) {
  return <ConnectCardNew connectedPlatforms={connections ?? []} />;
}

export function AuditStep(){
  const locale = useLocale()
  const [pending, setP] = useState(false)
  return (
    <Section title="AI Audit">
      <p className="mb-4 text-sm">Run the AI audit to extract insights from your connected accounts.</p>
      <div className="flex gap-2">
        <button onClick={async()=>{ setP(true); await fetch('/api/audit/run', { method:'POST' }).catch(()=>{}); setP(false) }} className="h-10 px-4 rounded-md border">Run Audit</button>
        <button onClick={async()=>{ await advance('MATCHES'); location.href=`/${locale}/tools/matches` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Matches</button>
      </div>
    </Section>
  )
}

export function MatchesStep(){
  const locale = useLocale()
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
        <button onClick={async()=>{ await advance('APPROVE'); location.href=`/${locale}/tools/approve` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Approve</button>
      </div>
    </Section>
  )
}

export function ApproveStep(){
  const locale = useLocale()
  return (
    <Section title="Approve Brands">
      <p className="mb-4 text-sm">Select the brands you want to pursue.</p>
      <div className="mb-3 text-sm">Selection saved automatically.</div>
      <button onClick={async()=>{ await advance('PACK'); location.href=`/${locale}/tools/pack` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Media Pack</button>
    </Section>
  )
}

export function PackStep(){
  const locale = useLocale()
  return (
    <Section title="Media Pack">
      <p className="mb-4 text-sm">Generate a tailored media pack.</p>
      <div className="flex gap-2">
        <button onClick={async()=>{ await fetch('/api/media-pack/generate', { method:'POST' }).catch(()=>{}) }} className="h-10 px-4 rounded-md border">Generate Pack</button>
        <button onClick={async()=>{ await advance('CONTACTS'); location.href=`/${locale}/brand-run` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Contacts</button>
      </div>
    </Section>
  )
}

export function ContactsStep(){
  const locale = useLocale()
  return (
    <Section title="Discover Contacts">
      <p className="mb-4 text-sm">Find decision makers for your approved brands.</p>
      <div className="flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href={`/${locale}/tools/contacts`}>Open Contact Finder</a>
        <button onClick={async()=>{ await advance('OUTREACH'); location.href=`/${locale}/outreach/inbox` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Next: Outreach</button>
      </div>
    </Section>
  )
}

export function OutreachStep(){
  const locale = useLocale()
  return (
    <Section title="Start Outreach">
      <p className="mb-4 text-sm">Kick off a 3–4 touch email sequence with safe defaults.</p>
      <div className="flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href={`/${locale}/tools/outreach`}>Open Outreach</a>
        <button onClick={async()=>{ await advance('COMPLETE'); location.href=`/${locale}/brand-run` }} className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white">Mark Complete</button>
      </div>
    </Section>
  )
}

export function CompleteStep(){
  const locale = useLocale()
  return (
    <Section title="All Done">
      <p className="text-sm">Great work! You can re-run any individual step from Tools or start a fresh Brand Run anytime.</p>
      <div className="mt-3 flex gap-2">
        <a className="h-10 px-4 rounded-md border inline-flex items-center" href={`/${locale}/dashboard`}>Go to Dashboard</a>
        <a className="h-10 px-4 rounded-md bg-[var(--brand-600)] text-white inline-flex items-center" href={`/${locale}/tools`}>Open Tools</a>
      </div>
    </Section>
  )
}
