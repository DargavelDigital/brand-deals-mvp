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
      
      // Transform the API response to match what our components expect
      if (j.audit) {
        setData(j.audit)
        return j.audit
      } else {
        setData(null)
        return null
      }
    }catch(e:any){
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
          socialAccounts: body.platforms || []
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
