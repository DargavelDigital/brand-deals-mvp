'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import DiscoveryForm, { type DiscoveryParams } from './DiscoveryForm'
import ResultsGrid from './ResultsGrid'
import useContactDiscovery from './useContactDiscovery'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { UpsellBanner } from '@/components/billing/UpsellBanner'
import { Button } from '@/components/ui/Button'
import { Users, Search, ChevronDown } from 'lucide-react'
import type { RankedBrand } from '@/types/match'

export default function DiscoverContactsPage() {
  const router = useRouter()
  const { discovering, results, error, discover, saveSelected, enriching, enrichContacts, saving, setResultsDirectly } = useContactDiscovery()
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<'ALL'|'VALID'|'RISKY'|'INVALID'>('ALL')
  const [plan, setPlan] = React.useState<string | null>(null)
  const [planLoading, setPlanLoading] = React.useState(false)
  const [showUpsell, setShowUpsell] = React.useState(false)
  const [approvedBrands, setApprovedBrands] = React.useState<RankedBrand[]>([])
  const [loadingBrands, setLoadingBrands] = React.useState(true)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [manualBrandName, setManualBrandName] = React.useState('')
  const [manualDomain, setManualDomain] = React.useState('')
  const [manualRoles, setManualRoles] = React.useState<string[]>([])
  const [manualSeniority, setManualSeniority] = React.useState<string[]>(['Director', 'VP'])
  const [loadedSavedContacts, setLoadedSavedContacts] = React.useState(false)
  const [showManualForm, setShowManualForm] = React.useState(false)
  const [pageError, setPageError] = React.useState<string | null>(null)

  const checkPlan = async () => {
    if (plan !== null) return plan; // Already checked
    
    setPlanLoading(true);
    try {
      const res = await fetch('/api/billing/summary');
      const json = await res.json();
      if (json.ok) {
        setPlan(json.plan);
        return json.plan;
      }
    } catch (err) {
      console.error('Plan check failed:', err);
    } finally {
      setPlanLoading(false);
    }
    return 'FREE'; // Default to FREE if check fails
  };

  const handleEnrich = async () => {
    const currentPlan = await checkPlan();
    if (currentPlan === 'FREE') {
      setShowUpsell(true);
      return;
    }
    setShowUpsell(false);
    await enrichContacts();
  };

  const handleSaveAndContinue = async (selectedContacts: Array<{id: string, name: string, email: string, title: string, brandId?: string, brandName?: string, source: string, linkedinUrl?: string}>) => {
    try {
      console.log('💾 Step 1: Starting save and continue...');
      console.log('💾 Selected contacts:', selectedContacts.length);
      
      console.log('💾 Step 2: Contact data:', selectedContacts.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        brandName: c.brandName
      })));
      
      // 1. Save contacts to database
      console.log('💾 Step 3: Calling saveSelected...');
      const selectedIds = selectedContacts.map(c => c.id);
      const savedContacts = await saveSelected(selectedIds);
      console.log('💾 Step 4: Saved contacts result:', savedContacts);
      console.log('✅ Saved', selectedContacts.length, 'contacts to database');
      
      // 2. Prepare contact data for BrandRun
      const contactData = selectedContacts.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        title: c.title,
        brandId: c.brandId,
        brandName: c.brandName,
        source: c.source,
        linkedinUrl: c.linkedinUrl
      }));
      
      console.log('💾 Step 5: Fetching current BrandRun...');
      
      // 3. Get current BrandRun (NO workspaceId - backend gets from session!)
      const currentRes = await fetch('/api/brand-run/current');
      console.log('💾 Step 6: BrandRun response status:', currentRes.status);
      
      if (!currentRes.ok) {
        const errorText = await currentRes.text();
        console.error('💾 Step 7 ERROR:', errorText);
        throw new Error(`Failed to fetch BrandRun: ${currentRes.status}`);
      }
      
      const currentRun = await currentRes.json();
      console.log('💾 Step 8: Current BrandRun:', currentRun);
      console.log('💾 Step 9: Contact data for BrandRun:', contactData.length, 'contacts');
      
      // 4. Update BrandRun with contact data (NO workspaceId!)
      console.log('💾 Step 7: Updating BrandRun...');
      const updatePayload = {
        // workspaceId: REMOVED - backend gets from session
        step: 'CONTACTS',
        selectedBrandIds: currentRun.data?.selectedBrandIds || currentRun.selectedBrandIds || [],
        runSummaryJson: {
          brands: currentRun.data?.runSummaryJson?.brands || currentRun.runSummaryJson?.brands || [],
          contacts: contactData // ✅ Add contacts
        }
      };
      console.log('💾 Step 10b: Update payload:', updatePayload);
      
      const updateRes = await fetch('/api/brand-run/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      
      console.log('💾 Step 11: BrandRun update response:', updateRes.status);
      
      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error('💾 Step 11 ERROR:', errorText);
        throw new Error(`Failed to update BrandRun: ${updateRes.status}`);
      }
      
      console.log('💾 Step 12: BrandRun updated successfully');
      
      // 5. Advance workflow to PACK
      console.log('💾 Step 13: Advancing workflow...');
      const advanceRes = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // workspaceId: REMOVED - backend gets from session
          step: 'PACK'
        })
      });
      
      console.log('💾 Step 14: Advance response:', advanceRes.status);
      
      if (!advanceRes.ok) {
        const errorText = await advanceRes.text();
        console.error('💾 Step 14 ERROR:', errorText);
        throw new Error(`Failed to advance workflow: ${advanceRes.status}`);
      }
      
      console.log('💾 Step 15: Workflow advanced successfully');
      
      // 6. Redirect to Media Pack
      console.log('💾 Step 16: Redirecting to media pack...');
      router.push('/tools/pack');
      
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save and continue'
      console.error('❌ Save and continue error:', message);
      console.error('❌ Error stack:', e instanceof Error ? e.stack : 'No stack');
      setPageError(`Failed to save contacts and continue: ${message}`);
      alert(`Failed to save contacts and continue: ${message}`);
    }
  };

  const handleManualSearch = async () => {
    if (!manualBrandName) {
      alert('Please enter a brand name');
      return;
    }
    
    console.log('🔍 Manual search for', manualBrandName);
    
    // Use the existing discover function
    await discover({
      brandName: manualBrandName,
      domain: manualDomain,
      industry: '',
      departments: ['Marketing', 'Partnerships'],
      seniority: manualSeniority,
      titles: manualRoles.join(', ')
    });
    
    // Clear form
    setManualBrandName('');
    setManualDomain('');
  };

  const toggleManualRole = (role: string) => {
    if (manualRoles.includes(role)) {
      setManualRoles(manualRoles.filter(r => r !== role));
    } else {
      setManualRoles([...manualRoles, role]);
    }
  };

  const toggleManualSeniority = (level: string) => {
    if (manualSeniority.includes(level)) {
      setManualSeniority(manualSeniority.filter(s => s !== level));
    } else {
      setManualSeniority([...manualSeniority, level]);
    }
  };

  // Helper to extract domain from URL
  const extractDomain = (url?: string): string | undefined => {
    if (!url) return undefined;
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return undefined;
    }
  };

  const autoSearchBrands = async (brands: RankedBrand[]) => {
    try {
      console.log('🔍 Auto-searching contacts for', brands.length, 'brands');
      
      // Default roles for auto-search (mid-senior marketing)
      const defaultRoles = [
        'CMO',
        'VP Marketing',
        'Marketing Director',
        'Partnerships Manager',
        'Influencer Marketing Manager'
      ];
      
      const defaultSeniorities = ['Director', 'VP', 'C-Level'];
      
      // Search each brand and tag results with brandId
      const searchPromises = brands.map(async (brand) => {
        const domain = brand.domain || extractDomain(brand.socials?.website);
        
        if (!domain || !brand.name) {
          console.log('⚠️ Skipping brand without domain:', brand.name);
          return [];
        }
        
        console.log('🔍 Searching contacts for:', brand.name);
        
        // Call discovery API directly to get results
        try {
          const res = await fetch('/api/contacts/discover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brandName: brand.name,
              domain: domain,
              industry: brand.categories?.[0] || '',
              departments: ['Marketing', 'Partnerships'],
              seniority: defaultSeniorities
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            const contacts = data.contacts || [];
            
            // Tag each contact with brandId and brandName
            return contacts.map((contact: any) => ({
              ...contact,
              brandId: brand.id,  // ✅ Add brandId
              brandName: brand.name // For display
            }));
          } else {
            console.warn('⚠️ Discovery failed for', brand.name);
            return [];
          }
        } catch (err) {
          console.error('❌ Error searching', brand.name, err);
          return [];
        }
      });
      
      const allResults = await Promise.all(searchPromises);
      const flatResults = allResults.flat();
      
      console.log('✅ Auto-search complete:', flatResults.length, 'contacts found');
      
      // Update results with all contacts tagged with brandId
      setResultsDirectly(flatResults);
      setHasSearched(true);
      
    } catch (e) {
      console.error('❌ Auto-search failed:', e);
    }
  };

  React.useEffect(() => {
    const loadApprovedBrands = async () => {
      try {
        setLoadingBrands(true);
        
        console.log('📞 Loading approved brands from BrandRun...');
        
        // Fetch current brand run (NO workspaceId - backend gets from session!)
        const res = await fetch('/api/brand-run/current');
        if (!res.ok) {
          console.log('⚠️ No BrandRun found - user should approve brands first');
          return;
        }
        
        const runData = await res.json();
        const selectedBrandIds = runData.data?.selectedBrandIds || runData.selectedBrandIds || [];
        
        console.log('📞 Found', selectedBrandIds.length, 'approved brands');
        
        // Get full brand objects from runSummaryJson
        const brands = runData.data?.runSummaryJson?.brands || 
                       runData.runSummaryJson?.brands || [];
        
        setApprovedBrands(brands);
        
        // Check if contacts were already discovered and saved
        const savedContacts = runData.data?.runSummaryJson?.contacts || 
                             runData.runSummaryJson?.contacts || [];
        
        if (savedContacts.length > 0) {
          console.log('📞 Found', savedContacts.length, 'previously saved contacts');
          
          // Pre-populate results
          setResultsDirectly(savedContacts);
          
          // Mark as already searched
          setHasSearched(true);
          setLoadedSavedContacts(true);
          
          console.log('✅ Loaded', savedContacts.length, 'previously discovered contacts');
        } else if (brands.length > 0 && !hasSearched) {
          // Auto-trigger search if brands exist and no saved contacts
          console.log('🔍 Auto-triggering contact search for approved brands...');
          await autoSearchBrands(brands);
        }
        
      } catch (e) {
        console.error('❌ Failed to load approved brands:', e);
      } finally {
        setLoadingBrands(false);
      }
    };
    
    loadApprovedBrands();
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return results.filter(r => {
      const okQ = !q || r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.company.toLowerCase().includes(q)
      const okS = status === 'ALL' || r.verifiedStatus === status
      return okQ && okS
    })
  }, [results, query, status])

  const onDiscover = async (params: DiscoveryParams) => { await discover(params) }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Tools', href: '/tools' },
        { label: 'Discover Contacts' }
      ]} />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Discover Contacts</h1>
        <p className="text-[var(--muted-fg)]">Find verified decision-makers at your target brands using smart discovery.</p>
      </div>

      {/* Auto-search Status Banners */}
      {loadingBrands && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">Loading approved brands...</p>
        </div>
      )}

      {!loadingBrands && approvedBrands.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">
            ✅ Searching contacts at {approvedBrands.length} approved brand{approvedBrands.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {!loadingBrands && approvedBrands.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">
            ⚠️ No approved brands found. Please go back to Matches and approve brands first.
          </p>
          <Button onClick={() => router.push('/tools/matches')} className="mt-2" variant="secondary" size="sm">
            ← Back to Matches
          </Button>
        </div>
      )}

      {/* Saved Contacts Indicator */}
      {loadedSavedContacts && results.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ℹ️ Showing {results.length} previously discovered contact{results.length === 1 ? '' : 's'}. 
            You can add more using the form below or continue to Media Pack.
          </p>
        </div>
      )}

      {/* Manual Discovery Form - Collapsible when auto-results exist */}
      {approvedBrands.length > 0 && results.length > 0 ? (
        <div className="card mb-6">
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface)] transition-colors rounded-lg"
          >
            <span className="flex items-center gap-2 font-medium">
              🔍 Search Additional Brands
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showManualForm ? 'rotate-180' : ''}`} />
          </button>
          
          {showManualForm && (
            <div className="p-4 pt-0 border-t border-[var(--border)]">
              <DiscoveryForm onDiscover={onDiscover} discovering={discovering} />
            </div>
          )}
        </div>
      ) : (
        <DiscoveryForm onDiscover={onDiscover} discovering={discovering} />
      )}

      {/* Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search name, title, email, company…"
            className="h-10 w-[280px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
          />
          <select
            value={status}
            onChange={e=>setStatus(e.target.value as 'ALL'|'VALID'|'RISKY'|'INVALID')}
            className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
          >
            <option value="ALL">All statuses</option>
            <option value="VALID">Valid</option>
            <option value="RISKY">Risky</option>
            <option value="INVALID">Invalid</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-[var(--muted-fg)]">
            {filtered.length} result{filtered.length===1?'':'s'}
          </div>
          {results.length > 0 && (
            <button
              onClick={handleEnrich}
              disabled={enriching || planLoading}
              className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enriching ? 'Enriching...' : planLoading ? 'Checking...' : 'Enrich'}
            </button>
          )}
        </div>
      </div>

      {/* Errors / Loading / Results */}
      {error && <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">{error}</div>}
      {pageError && (
        <div className="card p-4 border-red-200 bg-red-50">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-800">{pageError}</p>
            <button 
              onClick={() => setPageError(null)}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {showUpsell && (
        <UpsellBanner reason="AI enrichment requires Pro." />
      )}

      {discovering ? (
        <div className="card p-10 text-center">
          <ProgressBeacon label="Discovering contacts..." />
        </div>
      ) : results.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No contacts discovered yet" 
          description="Use the discovery form above to find verified decision-makers at your target brands."
        />
      ) : (
        <ResultsGrid 
          contacts={filtered} 
          onSaveSelected={saveSelected}
          onSaveAndContinue={handleSaveAndContinue}
        />
      )}

      {/* Manual Brand Search Section */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">
          🔎 Search Another Brand
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Brand Name *</label>
              <input
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                value={manualBrandName}
                onChange={(e) => setManualBrandName(e.target.value)}
                placeholder="e.g., Adidas"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Domain (optional)</label>
              <input
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                value={manualDomain}
                onChange={(e) => setManualDomain(e.target.value)}
                placeholder="e.g., adidas.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Target Roles</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'CEO',
                'CMO',
                'VP Marketing',
                'Marketing Director',
                'Partnerships Manager',
                'Brand Manager',
                'Social Media Director'
              ].map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualRoles.includes(role)}
                    onChange={() => toggleManualRole(role)}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]"
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Seniority</label>
            <div className="flex gap-4">
              {['Manager', 'Director', 'VP', 'C-Level'].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualSeniority.includes(level)}
                    onChange={() => toggleManualSeniority(level)}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleManualSearch}
            disabled={!manualBrandName || discovering}
            className="w-full h-10 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {discovering ? 'Searching...' : `Find Contacts at ${manualBrandName || 'Brand'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
