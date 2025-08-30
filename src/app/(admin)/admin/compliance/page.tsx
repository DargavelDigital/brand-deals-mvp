'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function CompliancePage() {
  const [policy, setPolicy] = useState<any>(null)
  const [exportJob, setExportJob] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ 
    fetch('/api/admin/retention/policy')
      .then(r=>r.json())
      .then(d=>setPolicy(d.policy))
      .catch(() => setPolicy({}))
  },[])

  const save = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/retention/policy', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(policy) 
      })
    } finally {
      setLoading(false)
    }
  }

  const startExport = async () => {
    setLoading(true)
    try {
      const j = await fetch('/api/admin/exports/start', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ kind:'workspace.full' })
      }).then(r=>r.json())
      
      setExportJob(j)
      
      // Process the export
      await fetch('/api/admin/exports/tick', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ jobId: j.jobId })
      })
      
      // In prod, poll status and show link from /api/admin/exports/status?id=...
    } finally {
      setLoading(false)
    }
  }

  const runPurge = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/retention/run', { method: 'POST' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance & Data Management</h1>
        <p className="text-[var(--muted-fg)]">
          Manage data retention policies, run compliance exports, and handle legal documentation.
        </p>
      </div>

      <Card className="p-6">
        <div className="text-lg font-semibold mb-3">Data Retention Policy</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['auditsDays','outreachDays','logsDays','contactsDays','mediaPacksDays'].map(k=>(
            <label key={k} className="text-sm">
              <div className="mb-1">{k}</div>
              <Input 
                type="number" 
                value={policy?.[k] ?? ''} 
                onChange={e=>setPolicy((p:any)=>({...p,[k]: e.target.value ? parseInt(e.target.value) : null}))}
                placeholder="Default: 365 days"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={save} disabled={loading}>
            {loading ? 'Saving...' : 'Save Policy'}
          </Button>
          <Button variant="secondary" onClick={runPurge} disabled={loading}>
            {loading ? 'Running...' : 'Run purge now'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-semibold mb-3">Exports</div>
        <Button onClick={startExport} disabled={loading}>
          {loading ? 'Starting...' : 'Start Workspace Export'}
        </Button>
        {exportJob && (
          <div className="mt-3 text-sm text-gray-600">
            Export started: {exportJob.jobId}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="text-lg font-semibold mb-3">Legal Templates</div>
        <div className="flex gap-3">
          <a className="underline" href="/api/admin/compliance/download?kind=dpa">Download DPA</a>
          <a className="underline" href="/api/admin/compliance/download?kind=baa">Download BAA</a>
          <a className="underline" href="/api/admin/compliance/download?kind=soc2">SOC2 Backlog</a>
        </div>
      </Card>
    </div>
  )
}
