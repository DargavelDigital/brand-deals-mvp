'use client';

import { 
  Plug, 
  Gauge, 
  BadgeCheck, 
  CheckSquare, 
  Images, 
  Users, 
  Send 
} from 'lucide-react'

const steps = [
  { id: 'CONNECT', label: 'Connect', icon: Plug, status: 'current' },
  { id: 'AUDIT', label: 'Audit', icon: Gauge, status: 'next' },
  { id: 'MATCHES', label: 'Matches', icon: BadgeCheck, status: 'next' },
  { id: 'APPROVE', label: 'Approve', icon: CheckSquare, status: 'next' },
  { id: 'PACK', label: 'Pack', icon: Images, status: 'next' },
  { id: 'CONTACTS', label: 'Contacts', icon: Users, status: 'next' },
  { id: 'OUTREACH', label: 'Outreach', icon: Send, status: 'next' },
]

export default function BrandRunPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Brand Run</h1>
        <p className="text-[var(--muted-fg)] mt-2">Execute your brand partnership workflow step by step.</p>
      </div>

      {/* Progress Stepper */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">Progress</h2>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'
            
            return (
              <div key={step.id} className="flex items-center">
                {/* Step */}
                <div className="flex flex-col items-center">
                  <div className={`
                    size-8 rounded-full grid place-items-center text-sm font-medium transition-colors
                    ${isCompleted 
                      ? 'bg-[var(--success)] text-white' 
                      : isCurrent 
                        ? 'bg-[var(--brand-600)] text-white' 
                        : 'bg-[var(--muted)] text-[var(--muted-fg)]'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckSquare className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <span className={`
                    text-xs mt-2 font-medium
                    ${isCurrent ? 'text-[var(--brand-600)]' : 'text-[var(--muted-fg)]'}
                  `}>
                    {step.label}
                  </span>
                </div>
                
                {/* Connector */}
                {!isLast && (
                  <div className="w-16 h-[2px] bg-[var(--border)] mx-4 relative">
                    {isCompleted && (
                      <div className="absolute inset-0 bg-[var(--success)]" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Connect Social Platforms</h2>
        <p className="text-[var(--muted-fg)] mb-6">
          Connect your social media accounts to start the brand run process. We'll analyze your content and audience to find the best brand matches.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'].map((platform) => (
            <div key={platform} className="card p-4 hover:bg-[var(--muted)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-[var(--muted)] grid place-items-center">
                  <span className="text-lg">📱</span>
                </div>
                <div>
                  <div className="font-medium">{platform}</div>
                  <div className="text-sm text-[var(--muted-fg)]">Not connected</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex gap-3">
          <button className="btn-primary px-6 py-2">
            Connect All
          </button>
          <button className="btn-secondary px-6 py-2">
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  )
}
