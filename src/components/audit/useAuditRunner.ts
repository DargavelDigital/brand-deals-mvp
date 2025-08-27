'use client'
import * as React from 'react'

type Result = any | null

export default function useAuditRunner(){
  const [running, setRunning] = React.useState(false)
  const [data, setData] = React.useState<Result>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLatest = React.useCallback(async ()=>{
    try{
      // Get workspaceId from cookie or use a default for demo purposes
      const wsId = document.cookie.split('; ').find(row => row.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      
      const r = await fetch(`/api/audit/latest?workspaceId=${wsId}`, { cache:'no-store' })
      if(!r.ok) throw new Error(`latest ${r.status}`)
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
      // Get workspaceId from cookie or use a default for demo purposes
      const wsId = document.cookie.split('; ').find(row => row.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      
      const r = await fetch('/api/audit/run', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          workspaceId: wsId,
          socialAccounts: body.platforms || []
        }),
      })
      if(!r.ok) throw new Error(`run ${r.status}`)
      
      // poll latest a few times
      for(let i=0;i<12;i++){
        await new Promise(res=>setTimeout(res, 1500))
        const latest = await fetchLatest()
        if(latest?.auditId){ break }
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
