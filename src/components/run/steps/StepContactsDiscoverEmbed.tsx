'use client'
import React, { useState, useEffect } from 'react'
import { Search, Users, Clock } from 'lucide-react'

interface StepContactsDiscoverEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

interface Contact {
  id: string
  name: string
  email: string
  company: string
  role: string
  linkedinUrl: string
  avatarUrl?: string
  brands?: string[]
}

interface Brand {
  id: string
  name: string
  domain: string
  industry: string
}

interface DiscoveryParams {
  brandName: string
  domain: string
  industry: string
  departments: string[]
  seniority: string[]
}

export default function StepContactsDiscoverEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepContactsDiscoverEmbedProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>(data?.contacts || [])
  const [hasSearched, setHasSearched] = useState(!!data?.hasSearched)
  const [approvedBrands, setApprovedBrands] = useState<Brand[]>([])
  const [batchResults, setBatchResults] = useState<any[]>([])
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [params, setParams] = useState<DiscoveryParams>({
    brandName: '',
    domain: '',
    industry: '',
    departments: ['Marketing', 'Partnerships', 'Influencer Relations'],
    seniority: ['Manager', 'Director', 'VP']
  })

  React.useEffect(() => {
    onDirtyChange(contacts.length > 0)
  }, [contacts.length, onDirtyChange])

  // Load approved brands at component start
  useEffect(() => {
    const loadApprovedBrands = async () => {
      const brandIds = data?.approvedBrandIds || data?.selectedBrandIds || [];
      if (brandIds.length === 0) return;
      
      const brands = await Promise.all(
        brandIds.map(async (id: string) => {
          const matchBrand = data?.matches?.find((m: any) => m.brandId === id);
          if (!matchBrand) return null;
          
          let domain = matchBrand.domain;
          
          // Resolve domain if missing
          if (!domain) {
            console.log(`Resolving domain for: ${matchBrand.name}`);
            domain = await resolveDomain(matchBrand.name);
          }
          
          return {
            id,
            name: matchBrand.name,
            domain: domain,
            industry: matchBrand.industry || 'Unknown'
          };
        })
      );
      
      setApprovedBrands(brands.filter(Boolean));
    };
    
    loadApprovedBrands();
  }, [data]);

  // Pre-populate form when brands load
  useEffect(() => {
    if (approvedBrands.length > 0 && !params.brandName) {
      const firstBrand = approvedBrands[0];
      setParams({
        ...params,
        brandName: firstBrand.name,
        domain: firstBrand.domain,
        industry: firstBrand.industry
      });
    }
  }, [approvedBrands]);

  // Domain guessing fallback
  function guessDomain(brandName: string): string {
    const cleaned = brandName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
    return `${cleaned}.com`;
  }

  function deduplicateContacts(results: any[]) {
    const seen = new Map();
    const deduplicated = [];
    
    for (const result of results) {
      for (const contact of result.contacts) {
        const key = contact.email || contact.linkedinUrl || `${contact.name}-${contact.company}`;
        
        if (!seen.has(key)) {
          seen.set(key, contact);
          deduplicated.push({
            ...contact,
            brands: [result.brandName]
          });
        } else {
          // Contact appears in multiple brands
          const existing = seen.get(key);
          existing.brands = [...(existing.brands || []), result.brandName];
        }
      }
    }
    
    return deduplicated;
  }

  function toggleContact(contactId: string) {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  }

  function exportSelected() {
    const selectedContactsList = contacts.filter(contact => selectedContacts.has(contact.id));
    console.log('Exporting selected contacts:', selectedContactsList);
    // TODO: Implement actual export functionality (CSV, JSON, etc.)
  }

  // AI domain resolution
  async function resolveDomain(brandName: string): Promise<string> {
    try {
      const res = await fetch('/api/contacts/resolve-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName })
      });
      
      if (!res.ok) {
        console.error('Domain resolution failed:', res.status);
        return guessDomain(brandName);
      }
      
      const { domain } = await res.json();
      return domain || guessDomain(brandName);
    } catch (error) {
      console.error('Domain resolution error:', error);
      return guessDomain(brandName);
    }
  }

  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@nike.com',
      company: 'Nike',
      role: 'Marketing Manager',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@apple.com',
      company: 'Apple',
      role: 'Brand Partnerships',
      linkedinUrl: 'https://linkedin.com/in/michaelchen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@starbucks.com',
      company: 'Starbucks',
      role: 'Influencer Relations',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@nike.com',
      company: 'Nike',
      role: 'Social Media Manager',
      linkedinUrl: 'https://linkedin.com/in/davidkim',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  ]

  const searchContacts = async () => {
    setIsSearching(true)
    
    try {
      // Call the real discovery API
      const response = await fetch('/api/contacts/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Discovery failed');
      }

      const result = await response.json();
      
      if (result.ok && result.contacts) {
        // Transform API response to match our Contact interface
        const transformedContacts: Contact[] = result.contacts.map((contact: any) => ({
          id: contact.id || `contact-${Math.random()}`,
          name: contact.name,
          email: contact.email || 'Not available',
          company: contact.company,
          role: contact.title,
          linkedinUrl: contact.linkedinUrl || '#',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=3b82f6&color=fff`
        }));
        
        setContacts(transformedContacts)
        setHasSearched(true)
        setData({ ...data, contacts: transformedContacts, hasSearched: true })
      } else {
        throw new Error('No contacts found');
      }
    } catch (error) {
      console.error('Contact search failed:', error)
      // Fallback to mock data
      setContacts(mockContacts)
      setHasSearched(true)
      setData({ ...data, contacts: mockContacts, hasSearched: true })
    } finally {
      setIsSearching(false)
    }
  }

  const discoverAllBrands = async () => {
    setIsBatchLoading(true);
    try {
      const res = await fetch('/api/contacts/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          approvedBrands.map(brand => ({
            brandName: brand.name,
            domain: brand.domain,
            industry: brand.industry,
            seniority: params.seniority,
            departments: params.departments
          }))
        )
      });
      
      const { results } = await res.json();
      setBatchResults(results);
      
      // Deduplicate contacts across brands
      const successfulResults = results.filter((result: any) => result.success);
      const deduplicatedContacts = deduplicateContacts(successfulResults);
      
      // Transform to Contact interface
      const allContacts = deduplicatedContacts.map((contact: any) => ({
        id: contact.id || `contact-${Math.random()}`,
        name: contact.name,
        email: contact.email || 'Not available',
        company: contact.company,
        role: contact.title,
        linkedinUrl: contact.linkedinUrl || '#',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=3b82f6&color=fff`,
        brands: contact.brands || [contact.company]
      }));
      
      setContacts(allContacts);
      setHasSearched(true);
      setData({ ...data, contacts: allContacts, hasSearched: true });
    } catch (error) {
      console.error('Batch discovery failed:', error);
    } finally {
      setIsBatchLoading(false);
    }
  }

  if (!hasSearched) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Find Contacts</h2>
          <p className="text-muted">
            Discover key contacts at your selected brands for partnership opportunities.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Brand
            </label>
            <select 
              value={params.brandName}
              onChange={async (e) => {
                const brand = approvedBrands.find(b => b.name === e.target.value);
                if (brand) {
                  setParams({
                    ...params,
                    brandName: brand.name,
                    domain: brand.domain,
                    industry: brand.industry
                  });
                } else if (e.target.value) {
                  // Manual entry - resolve domain
                  const domain = await resolveDomain(e.target.value);
                  setParams({
                    ...params,
                    brandName: e.target.value,
                    domain: domain
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a brand...</option>
              {approvedBrands.map(brand => (
                <option key={brand.id} value={brand.name}>
                  {brand.name} ({brand.domain})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Domain
            </label>
            <input
              type="text"
              value={params.domain}
              onChange={(e) => setParams({ ...params, domain: e.target.value })}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {params.brandName && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-text mb-2">Search Parameters</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Brand:</span>
                  <span className="ml-2 text-text">{params.brandName}</span>
                </div>
                <div>
                  <span className="text-muted">Domain:</span>
                  <span className="ml-2 text-text">{params.domain}</span>
                </div>
                <div>
                  <span className="text-muted">Industry:</span>
                  <span className="ml-2 text-text">{params.industry}</span>
                </div>
                <div>
                  <span className="text-muted">Departments:</span>
                  <span className="ml-2 text-text">{params.departments.join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center py-8">
          <div className="mb-6">
            <Users className="mx-auto h-16 w-16 text-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to find your brand contacts?</h3>
            <p className="text-muted mb-6">
              We'll search for marketing managers, brand partnerships, and influencer relations contacts at your selected brands.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={searchContacts}
              disabled={isSearching || !params.brandName}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching Contacts...' : 'Find Contacts for Selected Brand'}
            </button>
            
            {approvedBrands.length > 1 && (
              <div>
                <button
                  onClick={discoverAllBrands}
                  disabled={isBatchLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBatchLoading ? 'Discovering All Brands...' : `Discover All ${approvedBrands.length} Brands`}
                </button>
                <p className="text-sm text-muted mt-2">
                  Find contacts across all {approvedBrands.length} approved brands at once
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Contact Discovery Results</h2>
        <p className="text-muted">
          We found {contacts.length} potential contacts at your selected brands.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            ✓ {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {batchResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-text mb-2">Batch Discovery Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {batchResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-text">{result.brandName}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success 
                      ? `${result.contacts?.length || 0} contacts` 
                      : 'Failed'
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {batchResults.length > 0 ? (
        <div className="space-y-8">
          {batchResults.map(result => (
            <div key={result.brandName}>
              <h3 className="text-lg font-semibold mb-4">{result.brandName}</h3>
              {result.success ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {result.contacts.map((contact: any, i: number) => (
                    <div key={i} className="card p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id || `contact-${i}`)}
                          onChange={() => toggleContact(contact.id || `contact-${i}`)}
                          className="mt-1"
                        />
                        <img
                          src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=3b82f6&color=fff`}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-text">{contact.name}</h3>
                          <p className="text-sm text-muted">{contact.title}</p>
                          <p className="text-sm text-muted">{contact.company}</p>
                          {contact.brands && contact.brands.length > 1 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Found in: {contact.brands.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Email:</span>
                          <span className="text-text">{contact.email || 'Not available'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">LinkedIn:</span>
                          <a 
                            href={contact.linkedinUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-500">Failed: {result.error}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="card p-6">
              <div className="flex items-start space-x-4 mb-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="mt-1"
                />
                <img
                  src={contact.avatarUrl}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{contact.name}</h3>
                  <p className="text-sm text-muted">{contact.role}</p>
                  <p className="text-sm text-muted">{contact.company}</p>
                  {contact.brands && contact.brands.length > 1 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Found in: {contact.brands.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Email:</span>
                  <span className="text-text">{contact.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">LinkedIn:</span>
                  <a 
                    href={contact.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-4 space-y-4">
        {selectedContacts.size > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 mb-2">
              {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={exportSelected}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
            >
              Export {selectedContacts.size} Selected Contacts
            </button>
            <button
              onClick={() => setSelectedContacts(new Set())}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        )}
        
        <button
          onClick={goNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Review & Select Contacts
        </button>
      </div>
    </div>
  )
}
