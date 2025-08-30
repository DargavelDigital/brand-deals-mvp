'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface AgencyAttributionBannerProps {
  className?: string;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
}

export default function AgencyAttributionBanner({ className = '' }: AgencyAttributionBannerProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<{ name: string; ownerName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Get current user info from our new auth system
        const userResponse = await fetch('/api/agency/list', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          // Check if current user is a MANAGER (not OWNER)
          if (userData.ok && userData.items) {
            // Find the current user's role by checking cookies or using a simple heuristic
            // For now, let's check if there's a MANAGER role user
            const managerUser = userData.items.find((item: any) => item.role === 'MANAGER');
            const ownerUser = userData.items.find((item: any) => item.role === 'OWNER');
            
            if (managerUser && ownerUser) {
              // Assume current user is the manager if we see both roles
              setUserInfo({
                id: managerUser.id,
                email: managerUser.email,
                name: managerUser.name || managerUser.email,
                role: 'MANAGER',
                workspaceId: 'demo-workspace' // We'll get this from the auth context
              });

              setWorkspaceInfo({
                name: 'Demo Workspace',
                ownerName: ownerUser.name || ownerUser.email || 'Owner'
              });
            }
          }
        }
      } catch (error) {
        // Failed to check user role
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading || !userInfo || userInfo.role !== 'MANAGER') {
    return null;
  }

  return (
    <Card className={`bg-blue-50 border-blue-200 p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-sm">
            <span className="font-medium text-blue-900">
              Managing on behalf of {workspaceInfo?.ownerName}
            </span>
            <span className="text-blue-700 ml-2">
              • {workspaceInfo?.name}
            </span>
          </div>
        </div>
        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
          Manager
        </div>
      </div>
    </Card>
  );
}
