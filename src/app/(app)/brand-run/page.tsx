'use client'
import { useEffect, useState } from 'react'
import { getCurrentRun, upsertRun } from '@/services/brand-run/api'
import Stepper from '@/components/run/Stepper'
import RunRail from '@/components/run/RunRail'
import { ConnectStep, AuditStep, MatchesStep, ApproveStep, PackStep, ContactsStep, OutreachStep, CompleteStep } from '@/components/run/StepScreens'
import BottomBar from '@/components/run/BottomBar'

const map: Record<string, any> = {
  CONNECT: ConnectStep, AUDIT: AuditStep, MATCHES: MatchesStep, APPROVE: ApproveStep,
  PACK: PackStep, CONTACTS: ContactsStep, OUTREACH: OutreachStep, COMPLETE: CompleteStep
}

export default function BrandRunPage() {
  const [run, setRun] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    (async()=>{
      try {
        let cur = await getCurrentRun()
        if (!cur){ 
          cur = await upsertRun({ step:'CONNECT' }) 
        }
        setRun(cur); 
        setLoading(false)
      } catch (err) {
        console.error('Error loading brand run:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
        // Fallback to mock data
        setRun({
          id: 'mock_fallback',
          workspaceId: 'ws_fallback',
          step: 'CONNECT',
          stats: { brands: 0, creditsUsed: 0 }
        })
      }
    })()
  },[])

  if (loading) return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-2xl font-semibold mb-1">Brand Run</h1>
        <div className="text-sm text-[var(--muted-fg)] mb-4">Audit → Matches → Pack → Contacts → Outreach</div>
        <div className="p-6">Loading…</div>
      </div>
    </div>
  )

  if (error) {
    console.log('Showing fallback UI due to error:', error)
  }
  
  const Step = map[run?.step || 'CONNECT'] || ConnectStep

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-2xl font-semibold mb-1">Brand Run</h1>
        <div className="text-sm text-[var(--muted-fg)] mb-4">Audit → Matches → Pack → Contacts → Outreach</div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
          <div className="min-w-0 space-y-4">
            <Stepper step={run?.step || 'CONNECT'} />
            <Step />
          </div>
          <div className="min-w-0">
            {/* Sticky only on large screens to avoid mobile overflow */}
            <div className="lg:sticky lg:top-4">
              <RunRail 
                title="Run Status"
                items={[
                  { label: "Step", value: run?.step || 'CONNECT' },
                  { label: "Brands Selected", value: run?.stats?.brands?.toString() || '0' },
                  { label: "Credits Used", value: run?.stats?.creditsUsed?.toString() || '0' }
                ]}
                step={run?.step || 'CONNECT'}
                stats={run?.stats}
              />
            </div>
          </div>
        </div>
        {/* mobile sticky CTA */}
        {/* @ts-ignore */}
        {/* This is purely presentational and safe */}
        {/* place after <BrandRunClient /> */}
        {/* eslint-disable-next-line */}
        {/* <BottomBar /> */}
      </div>
    </div>
  )
}
