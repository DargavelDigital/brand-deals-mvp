'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Member {
  id: string;
  name: string;
  role: string;
  addedAt: string;
}

interface AgencyAccessData {
  items: Member[];
}

export default function AgencyAccessPage() {
  const [data, setData] = useState<AgencyAccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await fetch('/api/agency/list', {
        method: 'GET',
        credentials: 'include',
        headers: { 'x-no-cache': '1' },
        cache: 'no-store',
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      
      const responseData = await res.json();
      setData(responseData.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    try {
      const res = await fetch('/api/agency/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      
      await loadMembers();
      setInviteEmail('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      const res = await fetch('/api/agency/remove', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      
      await loadMembers();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRevokeAllAgencyAccess = async () => {
    if (!confirm('Are you sure you want to revoke access for all agency members? This will immediately remove their access to your workspace.')) {
      return;
    }
    
    try {
      const res = await fetch('/api/agency/revoke-all', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      
      await loadMembers();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER': return 'Owner';
      case 'MANAGER': return 'Manager';
      case 'MEMBER': return 'Member';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'MEMBER': return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <Section title="Agency Access" description="Manage workspace access">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-[var(--error)]">Error: {error}</div>
            <Button onClick={loadMembers}>Retry</Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Agency Access" description="Manage who can access your workspace">
      <div className="space-y-6">
        {/* Quick Agency Management */}
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800">Switch Agencies</h3>
              <p className="text-sm text-red-600 mt-1">
                Quickly revoke access for all agency members to switch to a new agency
              </p>
            </div>
            <Button
              onClick={handleRevokeAllAgencyAccess}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!data?.items?.some(member => member.role.toUpperCase() !== 'OWNER')}
            >
              Revoke All Agency Access
            </Button>
          </div>
        </Card>

        {/* Invite Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 border border-[var(--border)] rounded-md bg-white"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
            </select>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Invite
            </Button>
          </div>
        </Card>

        {/* Members List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="space-y-3">
            {data?.items?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-sm font-medium text-white">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-[var(--muted-fg)]">{member.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                  {member.role.toUpperCase() !== 'OWNER' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
