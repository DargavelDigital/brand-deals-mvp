'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Member {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  role: string;
  invitedBy?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
}

interface AgencyAccessData {
  memberships: Member[];
  groupedMembers: {
    OWNER: Member[];
    MANAGER: Member[];
    MEMBER: Member[];
    VIEWER: Member[];
  };
  currentUserRole: string;
  canInvite: boolean;
}

export default function AgencyAccessPage() {
  const [data, setData] = useState<AgencyAccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await fetch('/api/agency/list', {
        method: 'GET',
        // ensure NextJS edge/client includes cookies and disables cache
        credentials: 'include',
        headers: { 'x-no-cache': '1' },
        cache: 'no-store',
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.warn('agency/list non-OK', res.status, txt);
        if (res.status === 401) throw new Error('UNAUTHENTICATED');
        throw new Error('FAILED');
      }
      const data = await res.json();
      if (data.ok && data.items) {
        // Transform our new API response to match the expected format
        const transformedData: AgencyAccessData = {
          memberships: data.items.map((item: any) => ({
            id: item.id,
            user: {
              id: item.id,
              email: item.email,
              name: item.name
            },
            role: item.role,
            createdAt: new Date().toISOString() // We'll add this to the API later
          })),
          groupedMembers: {
            OWNER: data.items.filter((item: any) => item.role === 'OWNER').map((item: any) => ({
              id: item.id,
              user: {
                id: item.id,
                email: item.email,
                name: item.name
              },
              role: item.role,
              createdAt: new Date().toISOString()
            })),
            MANAGER: data.items.filter((item: any) => item.role === 'MANAGER').map((item: any) => ({
              id: item.id,
              user: {
                id: item.id,
                email: item.email,
                name: item.name
              },
              role: item.role,
              createdAt: new Date().toISOString()
            })),
            MEMBER: data.items.filter((item: any) => item.role === 'MEMBER').map((item: any) => ({
              id: item.id,
              user: {
                id: item.id,
                email: item.email,
                name: item.name
              },
              role: item.role,
              createdAt: new Date().toISOString()
            })),
            VIEWER: data.items.filter((item: any) => item.role === 'VIEWER').map((item: any) => ({
              id: item.id,
              user: {
                id: item.id,
                email: item.email,
                name: item.name
              },
              role: item.role,
              createdAt: new Date().toISOString()
            }))
          },
          currentUserRole: data.items.find((item: any) => item.role === 'OWNER') ? 'OWNER' : 'MANAGER',
          canInvite: data.items.some((item: any) => item.role === 'OWNER')
        };
        setData(transformedData);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      const response = await fetch('/api/agency/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: 'MANAGER' })
      });

      if (response.ok) {
        setInviteEmail('');
        await loadMembers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to invite: ${error.error}`);
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    
    setRemoving(userId);
    try {
      const response = await fetch('/api/agency/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        await loadMembers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to remove: ${error.error}`);
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove user');
    } finally {
      setRemoving(null);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await fetch('/api/auth/dev-login', { method: 'POST' });
      await loadMembers();
    } catch (error) {
      console.error('Demo login failed:', error);
      setError('Demo login failed');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Owner';
      case 'MANAGER': return 'Manager';
      case 'MEMBER': return 'Member';
      case 'VIEWER': return 'Viewer';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-blue-100 text-blue-800';
      case 'MANAGER': return 'bg-green-100 text-green-800';
      case 'MEMBER': return 'bg-yellow-100 text-yellow-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Section title="Agency Access" description="Manage workspace access">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--muted-fg)]">Loading...</div>
        </div>
      </Section>
    );
  }

  if (error === 'UNAUTHENTICATED') {
    return (
      <Section title="Agency Access" description="Manage workspace access">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-[var(--error)]">Authentication required</div>
            {(process.env.NEXT_PUBLIC_DEV_DEMO_AUTH === '1' || process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === '1') && (
              <Button onClick={handleDemoLogin}>
                Use Demo Login
              </Button>
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (!data) {
    return (
      <Section title="Agency Access" description="Manage workspace access">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--error)]">Failed to load data</div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Agency Access" description="Manage who can access your workspace">
      <div className="space-y-6">
        {/* Invite Form */}
        {data.canInvite && (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Invite Manager</h3>
            <p className="text-sm text-[var(--muted-fg)]">
              Invite an agency or manager to help run your workspace. They'll be able to run Brand Runs, 
              Outreach, and Media Packs on your behalf.
            </p>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="manager@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleInvite} 
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? 'Inviting...' : 'Send Invite'}
              </Button>
            </div>
          </Card>
        )}

        {/* Current Members */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Current Members</h3>
          
          {/* Owners */}
          {data.groupedMembers.OWNER.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--muted-fg)]">Owners</h4>
              {data.groupedMembers.OWNER.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[var(--muted)]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-sm font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-[var(--muted-fg)]">{member.user.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Managers */}
          {data.groupedMembers.MANAGER.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--muted-fg)]">Managers</h4>
              {data.groupedMembers.MANAGER.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[var(--muted)]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-sm font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-[var(--muted-fg)]">{member.user.email}</div>
                      {member.invitedBy && (
                        <div className="text-xs text-[var(--muted-fg)]">
                          Invited by {member.invitedBy.name || member.invitedBy.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    {data.canInvite && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemove(member.user.id)}
                        disabled={removing === member.user.id}
                      >
                        {removing === member.user.id ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Members */}
          {data.groupedMembers.MEMBER.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--muted-fg)]">Members</h4>
              {data.groupedMembers.MEMBER.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[var(--muted)]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-sm font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-[var(--muted-fg)]">{member.user.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {data.groupedMembers.VIEWER.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-[var(--muted-fg)]">Viewers</h4>
              {data.groupedMembers.VIEWER.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[var(--muted)]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-sm font-medium">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-[var(--muted-fg)]">{member.user.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.values(data.groupedMembers).every(group => group.length === 0) && (
            <div className="text-center py-8 text-[var(--muted-fg)]">
              No members found
            </div>
          )}
        </Card>

        {/* Permissions Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Manager Permissions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Managers Can:</h4>
              <ul className="text-sm space-y-1 text-[var(--muted-fg)]">
                <li>• Run Brand Runs</li>
                <li>• Generate Media Packs</li>
                <li>• Start Outreach Sequences</li>
                <li>• View Deals and Analytics</li>
                <li>• Manage Contacts and Brands</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">Managers Cannot:</h4>
              <ul className="text-sm space-y-1 text-[var(--muted-fg)]">
                <li>• Delete the workspace</li>
                <li>• Change billing plans</li>
                <li>• Remove other managers</li>
                <li>• Access admin settings</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
