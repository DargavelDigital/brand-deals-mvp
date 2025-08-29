'use client'
import ClientBoundary from '@/components/system/ClientBoundary'
import RunRail from '@/components/run/RunRail'
import { RunProgressWheel } from '@/components/run/RunProgressWheel'
import StepSelector from '@/components/run/StepSelector'

interface BrandRunClientProps {
  initialRun: any
}

export default function BrandRunClient({ initialRun }: BrandRunClientProps) {
  return (
    <ClientBoundary>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
        <div className="min-w-0 space-y-4">
          <RunProgressWheel step={initialRun?.step || 'CONNECT'} />
          <StepSelector step={initialRun?.step || 'CONNECT'} />
        </div>
        <div className="min-w-0">
          {/* Sticky only on large screens to avoid mobile overflow */}
          <div className="lg:sticky lg:top-4">
            <RunRail 
              title="Run Status"
              items={[
                { label: "Step", value: initialRun?.step || 'CONNECT' },
                { label: "Brands Selected", value: initialRun?.stats?.brands?.toString() || '0' },
                { label: "Credits Used", value: initialRun?.stats?.creditsUsed?.toString() || '0' }
              ]}
              step={initialRun?.step || 'CONNECT'}
              stats={initialRun?.stats}
            />
          </div>
        </div>
      </div>
    </ClientBoundary>
  )
}
