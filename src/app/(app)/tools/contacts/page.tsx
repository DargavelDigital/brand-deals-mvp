'use client';

import { useState, useEffect } from 'react';
import { Prereq } from '@/components/run/Prereq';

interface BrandRun {
  id: string;
  step: string;
  auto: boolean;
  auditId?: string;
  selectedBrandIds?: string[];
  mediaPackId?: string;
  contactIds?: string[];
  sequenceId?: string;
}

interface PrereqCheck {
  met: boolean;
  missing: string[];
  quickActions: Array<{
    label: string;
    action: string;
    href?: string;
  }>;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  phone?: string;
  verified: boolean;
}

export default function ContactsToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Mock workspace ID for demo
  const workspaceId = 'demo-workspace';

  useEffect(() => {
    // Fetch current run status
    fetch(`/api/brand-run/current?workspaceId=${workspaceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.run) {
          setRun(data.run);
        }
      })
      .catch(console.error);
  }, [workspaceId]);

  const handleDiscoverContacts = async () => {
    setIsDiscovering(true);
    
    // Simulate contact discovery
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockContacts: Contact[] = [
      {
        id: 'contact-1',
        name: 'Sarah Johnson',
        title: 'Partnerships Manager',
        company: 'EcoStyle',
        email: 'sarah.johnson@ecostyle.com',
        linkedin: 'linkedin.com/in/sarahjohnson',
        phone: '+1 (555) 123-4567',
        verified: true
      },
      {
        id: 'contact-2',
        name: 'Michael Chen',
        title: 'Brand Marketing Director',
        company: 'FitFlow',
        email: 'michael.chen@fitflow.com',
        linkedin: 'linkedin.com/in/michaelchen',
        verified: true
      },
      {
        id: 'contact-3',
        name: 'Emma Rodriguez',
        title: 'Influencer Relations',
        company: 'GreenBeauty',
        email: 'emma.rodriguez@greenbeauty.com',
        linkedin: 'linkedin.com/in/emmarodriguez',
        phone: '+1 (555) 987-6543',
        verified: true
      },
      {
        id: 'contact-4',
        name: 'David Kim',
        title: 'Marketing Manager',
        company: 'UrbanOutdoors',
        email: 'david.kim@urbanoutdoors.com',
        linkedin: 'linkedin.com/in/davidkim',
        verified: false
      }
    ];
    
    setContacts(mockContacts);
    setIsDiscovering(false);
  };

  const handleAdvance = async () => {
    if (!run || contacts.length === 0) return;

    try {
      // Record the contacts result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          contactIds: contacts.map(c => c.id)
        })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'OUTREACH' 
        })
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setRun(updatedRun.run);
      }
    } catch (error) {
      console.error('Error advancing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                Discover Contacts
              </h1>
              <p className="text-[var(--muted)]">
                Find the right people at your target brands to reach out to for partnerships.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Contact Discovery
              </h2>
              
              {!contacts.length ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)] mb-4">
                    We&apos;ll research and find the best contacts at your target brands for partnership discussions.
                  </p>
                  <button
                    onClick={handleDiscoverContacts}
                    disabled={isDiscovering}
                    className="bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                  >
                    {isDiscovering ? 'Discovering...' : 'Discover Contacts'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map(contact => (
                    <div key={contact.id} className="border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                                                 <div className="w-12 h-12 bg-[var(--brand)]/10 rounded-lg flex items-center justify-center">
                           <span className="text-[var(--brand)] font-semibold text-lg">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-[var(--text)]">{contact.name}</h3>
                              <p className="text-sm text-[var(--muted)]">{contact.title}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-[var(--muted)]">{contact.company}</span>
                              {contact.verified && (
                                <span className="px-2 py-1 bg-[var(--positive)]/20 text-[var(--positive)] text-xs rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-[var(--muted)]">Email:</span>
                              <a 
                                href={`mailto:${contact.email}`}
                                className="ml-2 text-[var(--brand)] hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                            <div>
                              <span className="text-[var(--muted)]">LinkedIn:</span>
                              <a 
                                href={`https://${contact.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-[var(--brand)] hover:underline"
                              >
                                View Profile
                              </a>
                            </div>
                            {contact.phone && (
                              <div>
                                <span className="text-[var(--muted)]">Phone:</span>
                                <a 
                                  href={`tel:${contact.phone}`}
                                  className="ml-2 text-[var(--brand)] hover:underline"
                                >
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {contacts.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Next Steps
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Excellent! You&apos;ve found {contacts.length} contacts. Now let&apos;s create an outreach sequence to start conversations.
                </p>
                <button
                  onClick={handleAdvance}
                  className="bg-[var(--secondary)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--secondary)]/80 transition-colors"
                >
                  Advance to Next Stage
                </button>
              </div>
            )}
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Run Status
              </h3>
              {run ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Current Step:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{run.step}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Mode:</span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {run.auto ? 'Auto' : 'Manual'}
                    </span>
                  </div>
                  {contacts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Contacts Found:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{contacts.length}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No active run</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
