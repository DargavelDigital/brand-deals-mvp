'use client';

import { DashboardGrid, Col } from '@/ui/containers';

export default function OutreachPage() {
  // Mock data for demonstration
  const mockTemplates = [
    {
      id: '1',
      name: 'Intro Email',
      subject: '{{creatorName}} × {{brandName}} — quick idea for your team',
      description: 'Initial outreach to introduce yourself and your content',
      variables: ['brandName', 'contactFirstName', 'creatorName', 'creatorUSP', 'topStat', 'insightOne', 'insightTwo', 'calendlyUrl', 'mediaPackUrl']
    },
    {
      id: '2',
      name: 'Proof Email',
      subject: 'Results from creators like {{creatorName}} + 1 idea for {{brandName}}',
      description: 'Follow-up with proof points and concrete ideas',
      variables: ['brandName', 'contactFirstName', 'creatorName', 'mediaPackUrl', 'calendlyUrl']
    },
    {
      id: '3',
      name: 'Nudge Email',
      subject: 'Last note — {{brandName}} collab options (15-min?)',
      description: 'Final follow-up with specific format proposals',
      variables: ['brandName', 'contactFirstName', 'creatorName', 'mediaPackUrl', 'calendlyUrl']
    }
  ];

  const mockOutreachHistory = [
    {
      id: '1',
      brand: 'Nike',
      template: 'Intro Email',
      sentAt: '2024-01-15T10:30:00Z',
      status: 'sent',
      response: null
    },
    {
      id: '2',
      brand: 'Apple',
      template: 'Proof Email',
      sentAt: '2024-01-14T15:45:00Z',
      status: 'responded',
      response: 'Interested in learning more. Can we schedule a call?'
    },
    {
      id: '3',
      brand: 'Starbucks',
      template: 'Nudge Email',
      sentAt: '2024-01-10T09:15:00Z',
      status: 'no-response',
      response: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-[var(--muted)] text-[var(--text)]';
      case 'responded': return 'bg-[var(--positive)] text-white';
      case 'no-response': return 'bg-[var(--warning)] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Outreach Management</h1>
        <p className="text-[var(--muted)]">Manage your email campaigns and templates</p>
      </div>

      <DashboardGrid>
        <Col className="md:col-span-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Email Templates</h2>
            <div className="space-y-4">
              {mockTemplates.map((template) => (
                <div key={template.id} className="border border-[var(--border)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--text)] mb-2">{template.name}</h3>
                  <p className="text-sm text-[var(--muted)] mb-2">{template.description}</p>
                  <p className="text-xs text-[var(--muted)] mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <span key={variable} className="px-2 py-1 bg-[var(--panel)] text-[var(--muted)] text-xs rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col className="md:col-span-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Recent Outreach</h2>
            <div className="space-y-3">
              {mockOutreachHistory.map((outreach) => (
                <div key={outreach.id} className="border border-[var(--border)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--text)]">{outreach.brand}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(outreach.status)}`}>
                      {outreach.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mb-1">{outreach.template}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(outreach.sentAt)}</p>
                  {outreach.response && (
                    <p className="text-sm text-[var(--text)] mt-2 italic">"{outreach.response}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </DashboardGrid>
    </div>
  );
}
