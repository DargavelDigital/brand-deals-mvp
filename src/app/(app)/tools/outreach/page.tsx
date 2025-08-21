'use client';

import { useState, useEffect } from 'react';

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

interface OutreachSequence {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
}

export default function OutreachToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [outreachSequence, setOutreachSequence] = useState<OutreachSequence | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

    // Mock contact data
    setContacts([
      {
        id: 'contact-1',
        name: 'Sarah Johnson',
        title: 'Partnerships Manager',
        company: 'EcoStyle',
        email: 'sarah.johnson@ecostyle.com'
      },
      {
        id: 'contact-2',
        name: 'Michael Chen',
        title: 'Brand Marketing Director',
        company: 'FitFlow',
        email: 'michael.chen@fitflow.com'
      },
      {
        id: 'contact-3',
        name: 'Emma Rodriguez',
        title: 'Influencer Relations',
        company: 'GreenBeauty',
        email: 'emma.rodriguez@greenbeauty.com'
      }
    ]);
  }, [workspaceId]);

  const handleStartOutreach = async () => {
    setIsCreating(true);
    
    // Simulate outreach sequence creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSequence: OutreachSequence = {
      id: 'sequence-123',
      name: 'Brand Partnership Outreach Q1 2024',
      description: 'Multi-touch outreach campaign to sustainable lifestyle brands',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    setOutreachSequence(mockSequence);
    setIsCreating(false);
  };

  const handleCompleteRun = async () => {
    if (!run || !outreachSequence) return;

    try {
      // Record the outreach sequence result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          sequenceId: outreachSequence.id
        })
      });

      // Complete the run
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'COMPLETED' 
        })
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setRun(updatedRun.run);
      }
    } catch (error) {
      console.error('Error completing run:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                Start Outreach
              </h1>
              <p className="text-[var(--muted)]">
                Launch your outreach campaign to connect with brand partners and start conversations.
              </p>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Outreach Campaign
              </h2>
              
              {!outreachSequence ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-[var(--muted)] mb-4">
                      We&apos;ll create a professional outreach sequence to introduce yourself and your partnership opportunities to your target brands.
                    </p>
                    <button
                      onClick={handleStartOutreach}
                      disabled={isCreating}
                      className="bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                    >
                      {isCreating ? 'Creating...' : 'Start Outreach'}
                    </button>
                  </div>

                  <div className="border border-[var(--border)] rounded-lg p-4">
                    <h3 className="font-semibold text-[var(--text)] mb-3">Target Contacts</h3>
                    <div className="space-y-2">
                      {contacts.map(contact => (
                        <div key={contact.id} className="flex items-center space-x-3">
                                                   <div className="w-8 h-8 bg-[var(--brand)]/10 rounded-lg flex items-center justify-center">
                           <span className="text-[var(--brand)] font-semibold text-sm">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text)]">{contact.name}</div>
                            <div className="text-sm text-[var(--muted)]">{contact.title} at {contact.company}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📧</div>
                    <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                      Outreach Campaign Launched!
                    </h3>
                    <p className="text-[var(--muted)] mb-4">
                      Your outreach sequence is now active and reaching out to potential brand partners.
                    </p>
                  </div>

                  <div className="border border-[var(--border)] rounded-lg p-4">
                    <h3 className="font-semibold text-[var(--text)] mb-3">Campaign Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Name:</span>
                        <span className="text-[var(--text)]">{outreachSequence.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Description:</span>
                        <span className="text-[var(--text)]">{outreachSequence.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Status:</span>
                        <span className="text-[var(--success)] font-medium">{outreachSequence.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Created:</span>
                        <span className="text-[var(--text)]">
                          {new Date(outreachSequence.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                                     <div className="bg-[var(--positive)]/10 border border-[var(--positive)]/20 rounded-lg p-4">
                                         <h3 className="font-semibold text-[var(--positive)] mb-2">What happens next?</h3>
                     <ul className="space-y-1 text-sm text-[var(--positive)]">
                      <li>• Personalized emails sent to each contact</li>
                      <li>• Follow-up sequence scheduled automatically</li>
                      <li>• Response tracking and analytics</li>
                      <li>• Partnership discussions initiated</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {outreachSequence && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Complete Brand Run
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Congratulations! You&apos;ve successfully completed all steps of your Brand Run. Your outreach campaign is now active.
                </p>
                <button
                  onClick={handleCompleteRun}
                                     className="bg-[var(--positive)] text-white py-2 px-4 rounded-md font-medium hover:bg-[var(--positive)]/90 transition-colors"
                >
                  Complete Brand Run
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Contacts:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{contacts.length}</span>
                  </div>
                  {outreachSequence && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Outreach:</span>
                      <span className="text-sm font-medium text-[var(--success)]">Active</span>
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
