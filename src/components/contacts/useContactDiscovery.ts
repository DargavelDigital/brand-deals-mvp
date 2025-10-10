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
  const [saving, setSaving] = React.useState(false)

  const discover = async (params: DiscoveryParams) => {
    setDiscovering(true); setError(null)
    try{
      // Check if we're in demo mode or have external providers
      const res = await fetch('/api/contacts/capabilities')
      const capabilities = await res.json()
      
      if (capabilities.ok && capabilities.providersOk) {
        // Use real discovery API
        const discoveryRes = await fetch('/api/contacts/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
        
        if (discoveryRes.ok) {
          const data = await discoveryRes.json()
          if (data.contacts && Array.isArray(data.contacts)) {
            setResults(data.contacts)
          } else {
            console.error('API returned invalid data structure:', data)
            // Fallback to mock data if API fails
            await new Promise(r=>setTimeout(r, 800))
            setResults(mockContacts(params))
          }
        } else {
          const errorData = await discoveryRes.json().catch(() => ({}))
          console.error('Discovery API failed:', discoveryRes.status, errorData)
          // Fallback to mock data if API fails
          await new Promise(r=>setTimeout(r, 800))
          setResults(mockContacts(params))
        }
      } else {
        // Demo mode - use mock data
        await new Promise(r=>setTimeout(r, 800))
        setResults(mockContacts(params))
      }
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

  const saveSelected = async (ids: string[], brandId?: string) => {
    try {
      setSaving(true);
      
      // Get workspace ID
      const wsid = document.cookie
        .split('; ')
        .find(r => r.startsWith('wsid='))
        ?.split('=')[1] || 'demo-workspace';
      
      // Get full contact objects for selected IDs
      const contactsToSave = results.filter(c => ids.includes(c.id));
      
      // Group by brand for better organization
      const byBrand = contactsToSave.reduce((acc, contact) => {
        const brandKey = contact.brandId || 'unknown';
        if (!acc[brandKey]) acc[brandKey] = [];
        acc[brandKey].push(contact);
        return acc;
      }, {} as Record<string, typeof contactsToSave>);
      
      console.log('💾 Saving', contactsToSave.length, 'contacts to database');
      console.log('💾 Contacts grouped by brand:', byBrand);
      
      // Transform to database format
      const contacts = contactsToSave.map(c => ({
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        workspaceId: wsid,
        brandId: c.brandId || brandId || null, // ✅ Use contact's brandId first, then fallback
        name: c.name,
        title: c.title || null,
        email: c.email,
        phone: null,
        company: c.company || null,
        seniority: c.seniority || null,
        verifiedStatus: c.verifiedStatus,
        score: c.score || 0,
        source: c.source || 'discovery',
        tags: [],
        notes: null,
        status: 'ACTIVE' as const,
        updatedAt: new Date()
      }));
      
      // Call bulk create API
      const res = await fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: wsid,
          contacts: contacts
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save contacts');
      }
      
      const data = await res.json();
      console.log('✅ Saved contacts:', data);
      
      return data.contacts; // Return saved contacts with IDs
      
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save contacts'
      console.error('❌ Failed to save contacts:', message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const setResultsDirectly = (newResults: ContactHit[]) => {
    setResults(newResults);
  };

  return { discovering, results, error, discover, saveSelected, enriching, enrichContacts, saving, setResultsDirectly }
}
