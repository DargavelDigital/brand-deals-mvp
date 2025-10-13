'use client'
import * as React from 'react'

type Result = any | null

export default function useAuditRunner(){
  const [running, setRunning] = React.useState(false)
  const [data, setData] = React.useState<Result>(null)
  const [error, setError] = React.useState<string | null>(null)

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
          stageMessage: snapshot.stageMessage,
          creatorProfile: snapshot.creatorProfile,
          strengthAreas: snapshot.strengthAreas || [],
          growthOpportunities: snapshot.growthOpportunities || [],
          nextMilestones: snapshot.nextMilestones || [],
          brandFit: snapshot.brandFit,
          immediateActions: snapshot.immediateActions || [],
          strategicMoves: snapshot.strategicMoves || []
        }
        
        console.log('🔴 Transformed audit data:', transformed)
        setData(transformed)
        return transformed
      } else {
        setData(null)
        return null
      }
    }catch(e:any){
      console.error('🔴 Failed to fetch latest audit:', e)
      setError(e.message ?? 'Failed to load latest audit')
      return null
    }
  },[])

  const run = React.useCallback(async (body: { platforms?: string[] } = {} )=>{
    setError(null)
    setRunning(true)
    try{
      // Let the server resolve workspace ID (no hardcoded workspace ID)
      const r = await fetch('/api/audit/run', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          socialAccounts: body.platforms || [],
          provider: body.platforms?.[0] || 'instagram'  // ✅ Send correct provider
        }),
      })
      if(!r.ok) {
        const errorData = await r.json().catch(() => ({}))
        throw new Error(errorData.error || `run ${r.status}`)
      }
      
      const result = await r.json()
      
      // If inline mode, immediately fetch latest
      if (result.auditId) {
        await fetchLatest()
      } else if (result.jobId) {
        // Poll latest a few times for queue mode
        for(let i=0;i<12;i++){
          await new Promise(res=>setTimeout(res, 1500))
          const latest = await fetchLatest()
          if(latest?.auditId){ break }
        }
      }
    }catch(e:any){
      setError(e.message ?? 'Audit failed')
    }finally{
      setRunning(false)
    }
  },[fetchLatest])

  React.useEffect(()=>{ fetchLatest() },[fetchLatest])

  return { running, data, error, run, refresh: fetchLatest }
}
