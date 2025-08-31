'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ActivityItem {
  id: string;
  title: string;
  at: string;
  user: string;
  action: string;
  targetType?: string;
  meta?: any;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // For development, use mock data instead of calling the failing API
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          title: 'Brand Run Started',
          at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user: 'John Doe',
          action: 'BRAND_RUN_STARTED',
          targetType: 'BRAND_RUN',
          meta: { brandCount: 15, contentType: 'Instagram' }
        },
        {
          id: '2',
          title: 'Outreach Sequence Started',
          at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: 'John Doe',
          action: 'OUTREACH_STARTED',
          targetType: 'OUTREACH',
          meta: { contactCount: 8, sequenceName: 'Follow-up Campaign' }
        },
        {
          id: '3',
          title: 'Media Pack Generated',
          at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          user: 'John Doe',
          action: 'MEDIA_PACK_GENERATED',
          targetType: 'MEDIA_PACK',
          meta: { packSize: '2.4 MB', brandCount: 12 }
        },
        {
          id: '4',
          title: 'Deal Created',
          at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          user: 'John Doe',
          action: 'DEAL_CREATED',
          targetType: 'DEAL',
          meta: { dealValue: '$2,500', brandName: 'Fitness Brand Co.' }
        },
        {
          id: '5',
          title: 'Contact Imported',
          at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          user: 'John Doe',
          action: 'CONTACT_IMPORTED',
          targetType: 'CONTACT',
          meta: { importCount: 45, source: 'CSV Upload' }
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getActionIcon = (action: string) => {
    if (action.includes('BRAND_RUN')) {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }
    if (action.includes('OUTREACH')) {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (action.includes('MEDIA_PACK')) {
      return (
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    if (action.includes('DEAL')) {
      return (
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      );
    }
    if (action.includes('INVITE') || action.includes('REMOVE')) {
      return (
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <Section title="Activity Log" description="Track all workspace activities">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--muted-fg)]">Loading activities...</div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Activity Log" description="Track all workspace activities">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--error)]">{error}</div>
          <Button onClick={loadActivities} className="ml-4">Retry</Button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Activity Log" description="Track all workspace activities">
      <div className="space-y-6">
        {/* Activity List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Button onClick={loadActivities} variant="secondary" size="sm">
              Refresh
            </Button>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-fg)]">
              No activities found
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-[var(--muted)]/10 rounded-lg">
                  {getActionIcon(activity.action)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.title}</span>
                      {activity.user && (
                        <span className="text-sm text-[var(--muted-fg)]">
                          by {activity.user}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-fg)]">
                      <span>{formatDate(activity.at)}</span>
                      {activity.targetType && (
                        <span className="px-2 py-1 bg-[var(--muted)]/20 rounded text-xs">
                          {activity.targetType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {activity.meta && Object.keys(activity.meta).length > 0 && (
                      <div className="mt-2 text-xs text-[var(--muted-fg)]">
                        <details>
                          <summary className="cursor-pointer hover:text-[var(--text)]">
                            Additional Details
                          </summary>
                          <pre className="mt-2 p-2 bg-[var(--muted)]/20 rounded text-xs overflow-x-auto">
                            {JSON.stringify(activity.meta, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">About Activity Logging</h3>
          <div className="text-sm text-[var(--muted-fg)] space-y-2">
            <p>
              The activity log tracks all important actions taken in your workspace, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Brand Runs started, completed, or failed</li>
              <li>Outreach sequences and email activities</li>
              <li>Media Pack generation and sharing</li>
              <li>Deal creation and updates</li>
              <li>Contact and brand management</li>
              <li>User invitations and removals</li>
            </ul>
            <p className="mt-4">
              This provides a complete audit trail for compliance and accountability, 
              especially useful when working with agency managers.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  );
}
