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

  const saveSelected = async (ids: string[]) => {
    // TODO: call your /api/contacts bulk create
    // For now just simulate success
    await new Promise(r=>setTimeout(r, 500))
    console.log('Saving contacts:', ids)
  }

  return { discovering, results, error, discover, saveSelected }
}
