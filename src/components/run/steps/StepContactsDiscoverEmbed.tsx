'use client'
import React, { useState } from 'react'
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

  React.useEffect(() => {
    onDirtyChange(contacts.length > 0)
  }, [contacts.length, onDirtyChange])

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
      // Simulate API call to find contacts
      await new Promise(resolve => setTimeout(resolve, 2000))
      setContacts(mockContacts)
      setHasSearched(true)
      setData({ ...data, contacts: mockContacts, hasSearched: true })
    } catch (error) {
      console.error('Contact search failed:', error)
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
            disabled={isSearching}
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
