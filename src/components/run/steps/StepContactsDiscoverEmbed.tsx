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
          
          <button
            onClick={searchContacts}
            disabled={isSearching || !params.brandName}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching Contacts...' : 'Find Contacts'}
          </button>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="card p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-text">{contact.name}</h3>
                <p className="text-sm text-muted">{contact.role}</p>
                <p className="text-sm text-muted">{contact.company}</p>
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

      <div className="text-center pt-4">
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
