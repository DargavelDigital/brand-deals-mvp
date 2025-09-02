'use client'

import * as React from 'react'
import type { DiscoveryParams } from './DiscoveryForm'
import type { ContactHit } from './ResultsGrid'

function mockContacts(p: DiscoveryParams): ContactHit[] {
  const base = [
    ['Alex Patel','Head of Influencer Marketing','Head','VALID',98,'LinkedIn + Email Verification'],
    ['Morgan Lee','Brand Partnerships Manager','Manager','VALID',92,'Company + Verify'],
    ['Jamie Chen','Social Media Lead','Lead','RISKY',80,'LinkedIn'],
    ['Taylor Kim','Director, Brand','Director','VALID',90,'LinkedIn'],
    ['Jordan Fox','VP Growth','VP','INVALID',60,'Guess'],
  ] as const
  return base.map((b,i)=>({
    id: `${p.domain}-${i}`,
    name: b[0],
    title: b[1],
    seniority: b[2],
    verifiedStatus: b[3] as any,
    score: b[4] as number,
    source: b[5],
    email: `${b[0].toLowerCase().replace(' ','')}@${p.domain}`,
    company: p.brandName,
    domain: p.domain
  }))
}

export default function useContactDiscovery(){
  const [discovering, setDiscovering] = React.useState(false)
  const [results, setResults] = React.useState<ContactHit[]>([])
  const [error, setError] = React.useState<string|null>(null)
  const [enriching, setEnriching] = React.useState(false)

  const discover = async (params: DiscoveryParams) => {
    setDiscovering(true); setError(null)
    try{
      await new Promise(r=>setTimeout(r, 800))
      setResults(mockContacts(params))
    }catch(e: unknown){
      const message = e instanceof Error ? e.message : 'Discovery failed'
      setError(message)
    }finally{
      setDiscovering(false)
    }
  }

  const enrichContacts = async () => {
    if (results.length === 0) return
    
    setEnriching(true)
    try {
      const res = await fetch('/api/contacts/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidates: results.map(r => ({
            name: r.name, 
            email: r.email, 
            domain: r.domain, 
            company: r.company, 
            linkedinUrl: r.linkedinUrl, 
            title: r.title
          })) 
        })
      })
      
      const json = await res.json()
      if (json.ok && json.items) {
        // Merge enriched data back into results
        const enrichedResults = results.map(result => {
          const enriched = json.items.find((item: any) => 
            item.name === result.name && item.company === result.company
          )
          if (enriched) {
            return {
              ...result,
              email: enriched.email || result.email,
              title: enriched.title || result.title,
              linkedinUrl: enriched.linkedinUrl || result.linkedinUrl,
              enrichedSource: enriched.source,
              confidence: enriched.confidence
            }
          }
          return result
        })
        setResults(enrichedResults)
      }
    } catch (err) {
      console.error('Enrichment failed:', err)
    } finally {
      setEnriching(false)
    }
  }

  const saveSelected = async (ids: string[]) => {
    // TODO: call your /api/contacts bulk create
    // For now just simulate success
    await new Promise(r=>setTimeout(r, 500))
    console.log('Saving contacts:', ids)
  }

  return { discovering, results, error, discover, saveSelected, enriching, enrichContacts }
}
