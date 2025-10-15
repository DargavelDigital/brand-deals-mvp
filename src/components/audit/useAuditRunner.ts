'use client'
import * as React from 'react'

type Result = any | null

export default function useAuditRunner(){
  const [running, setRunning] = React.useState(false)
  const [data, setData] = React.useState<Result>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [jobId, setJobId] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [stage, setStage] = React.useState('')

  const fetchLatest = React.useCallback(async ()=>{
    try{
      // Let the server resolve workspace ID (no hardcoded workspace ID)
      const r = await fetch('/api/audit/latest', { cache:'no-store' })
      if(!r.ok) {
        const errorData = await r.json().catch(() => ({}))
        throw new Error(errorData.error || `latest ${r.status}`)
      }
      const j = await r.json()
      
      console.log('🔴 Audit latest response:', j)
      
      // Transform the API response to match what our components expect
      if (j.audit) {
        const audit = j.audit
        const snapshot = audit.snapshotJson || {}
        
        console.log('🔴 Audit snapshot:', snapshot)
        console.log('🔴 Audit snapshot keys:', Object.keys(snapshot))
        
        // Data is stored directly in snapshot, NOT in metadata.auditResult
        // Structure: { audience, performance, contentSignals, insights, similarCreators, socialSnapshot }
        
        // Transform to AuditResultFront format (with v2 enhanced fields)
        const transformed = {
          auditId: audit.id,
          sources: audit.sources || [],
          audience: snapshot.audience || {
            totalFollowers: 0,
            avgEngagement: 0,
            reachRate: 0,
            avgLikes: 0,
            avgComments: 0,
            avgShares: 0
          },
          insights: snapshot.insights || [],
          similarCreators: snapshot.similarCreators || [],
          
          // Enhanced v2/v3 fields
          stageInfo: snapshot.stageInfo,
          brandFit: snapshot.brandFit,
          contentSignals: snapshot.contentSignals,
          performance: snapshot.performance,
          socialSnapshot: snapshot.socialSnapshot,
          
          // Legacy fields for compatibility
          auditResult: snapshot.auditResult || snapshot,
          metadata: snapshot.metadata || {}
        }
        
        console.log('🔴 Transformed audit data:', transformed)
        setData(transformed)
      } else {
        setData(null)
      }
    }catch(e:any){
      console.error('🔴 Error fetching latest audit:', e)
      setError(e.message ?? 'Failed to fetch latest audit')
    }
  },[])

  const run = React.useCallback(async (body: { platforms: string[]; useFakeAccount?: boolean })=>{
    setRunning(true)
    setError(null)
    setProgress(0)
    setStage('')
    
    try{
      // Let the server resolve workspace ID (no hardcoded workspace ID)
      const r = await fetch('/api/audit/run', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          socialAccounts: body.platforms || [],
          provider: body.platforms?.[0] || 'instagram',
          useFakeAccount: body.useFakeAccount || false  // Pass admin flag to API
        }),
      })
      if(!r.ok) {
        const errorData = await r.json().catch(() => ({}))
        throw new Error(errorData.error || `run ${r.status}`)
      }
      
      const result = await r.json()
      
      // Synchronous mode - audit completed immediately
      if (result.ok) {
        console.log('✅ Audit completed successfully:', result.auditId)
        setRunning(false)
        // Refresh to show new audit results
        await fetchLatest()
      } else {
        setError(result.error || 'Audit failed')
        setRunning(false)
      }
    }catch(e:any){
      setError(e.message ?? 'Audit failed')
      setRunning(false)
    }
  },[fetchLatest])

  const pollJobStatus = React.useCallback(async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/audit/status/${jobId}`)
        const status = await statusRes.json()
        
        setProgress(status.progress || 0)
        setStage(status.stage || '')
        
        if (status.status === 'complete') {
          clearInterval(pollInterval)
          setRunning(false)
          setJobId(null)
          // Refresh the page to show results
          window.location.reload()
        }
        
        if (status.status === 'failed') {
          clearInterval(pollInterval)
          setRunning(false)
          setJobId(null)
          setError(`Audit failed: ${status.error}`)
        }
      } catch (err) {
        console.error('Error polling job status:', err)
        clearInterval(pollInterval)
        setRunning(false)
        setJobId(null)
        setError('Failed to check audit status')
      }
    }, 2000) // Poll every 2 seconds
  }, [])

  React.useEffect(()=>{ fetchLatest() },[fetchLatest])

  return { running, data, error, run, refresh: fetchLatest, jobId, progress, stage }
}