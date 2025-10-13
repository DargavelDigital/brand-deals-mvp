'use client'
import * as React from 'react'

export type ApprovedBrand = {
  id: string
  name: string
  logo?: string
  industry?: string
  description?: string
  primaryColor?: string
}

async function getWorkspaceId() {
  const cookie = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1]
  if (!cookie) {
    throw new Error('No workspace ID found. Please log in.')
  }
  return cookie
}

export default function useMediaPack(){
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string|null>(null)
  const [approvedBrands, setApprovedBrands] = React.useState<ApprovedBrand[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [current, setCurrent] = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])

  React.useEffect(()=>{
    (async ()=>{
      try {
        setLoading(true); setError(null)
        const wsid = await getWorkspaceId()
        const runRes = await fetch(`/api/brand-run/current?workspaceId=${encodeURIComponent(wsid)}`)
        if(!runRes.ok) throw new Error('Could not load Brand Run')
        const response = await runRes.json()
        
        // Handle the nested data structure
        const run = response.data || response.run
        const approvedIds: string[] = run?.selectedBrandIds ?? []

        // For demo purposes, if no approved brands, create some mock ones
        if (!approvedIds.length) {
          const mockBrands: ApprovedBrand[] = [
            { id: 'demo-1', name: 'Nike', description: 'Global sportswear leader', industry: 'Sports & Fitness', primaryColor: '#000000', logo: 'nike.com' },
            { id: 'demo-2', name: 'Coca-Cola', description: 'World\'s most recognized beverage brand', industry: 'Food & Beverage', primaryColor: '#DC143C', logo: 'coca-cola.com' },
            { id: 'demo-3', name: 'Apple', description: 'Innovative technology company', industry: 'Technology', primaryColor: '#007AFF', logo: 'apple.com' }
          ]
          setApprovedBrands(mockBrands)
          setLoading(false)
          return
        }

        // Try a byIds endpoint; else fallback to /api/match/top and filter
        let details: ApprovedBrand[] = []
        try{
          const r = await fetch('/api/match/byIds', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ids: approvedIds})})
          if (r.ok) details = (await r.json())?.brands ?? []
        }catch{}

        if (!details.length && approvedIds.length) {
          const r = await fetch('/api/match/top', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ workspaceId: wsid, criteria:{ ids: approvedIds }})})
          if (r.ok) {
            const pool = (await r.json())?.matches?.brands ?? []
            details = pool.filter((b:any)=> approvedIds.includes(b.id))
          }
        }

        if (!details.length) {
          details = approvedIds.map((id,i)=>({ id, name:`Brand ${i+1}`, description:'Brand description'}))
        }
        setApprovedBrands(details)
      } catch(e:any){
        setError(e.message ?? 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  },[])

  const generate = async ({ template, customizations, brands }:{
    template:'default'|'brand',
    customizations: Record<string, any>,
    brands: ApprovedBrand[]
  })=>{
    setIsGenerating(true); setError(null)
    try {
      const wsid = await getWorkspaceId()
      
      // Map the client format to the API format
      const variant = template === 'default' ? 'classic' : 'bold'
      const brandIds = brands.map(b => b.id)
      
      const res = await fetch('/api/media-pack/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          workspaceId: wsid,
          variant,
          brandIds,
          theme: customizations // Pass customizations as theme
        })
      })
      if(!res.ok) throw new Error('Generation failed')
      const { mediaPack } = await res.json()
      setCurrent(mediaPack)
      setHistory(prev => [mediaPack, ...prev])
      return mediaPack
    } catch(e:any){
      setError(e.message ?? 'Generation failed')
      throw e
    } finally {
      setIsGenerating(false)
    }
  }

  return { loading, error, approvedBrands, isGenerating, current, history, generate }
}
