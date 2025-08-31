'use client'

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { flags } from "@/config/flags";

interface FlagInfo {
  key: string;
  value: any;
  source: 'env' | 'workspace' | 'default';
  description: string;
  category: string;
  impact: string;
}

const FLAG_DESCRIPTIONS: Record<string, { description: string; category: string; impact: string }> = {
  'ai.adapt.feedback': { 
    description: 'AI adaptation feedback system for improving AI responses based on user feedback', 
    category: 'AI',
    impact: 'Enhances AI quality and user experience'
  },
  'pwa.enabled': { 
    description: 'Progressive Web App features including offline support and app-like experience', 
    category: 'Platform',
    impact: 'Improves mobile user experience and engagement'
  },
  'push.enabled': { 
    description: 'Push notification system for real-time alerts and engagement', 
    category: 'Platform',
    impact: 'Increases user retention and engagement'
  },
  'crm.light.enabled': { 
    description: 'CRM lightweight mode with simplified interface and core features only', 
    category: 'CRM',
    impact: 'Faster loading and simpler user experience'
  },
  'crm.reminders.enabled': { 
    description: 'CRM reminder system for deal follow-ups and task management', 
    category: 'CRM',
    impact: 'Improves deal management and follow-up efficiency'
  },
  'compliance.mode': { 
    description: 'Enhanced compliance features including audit trails and data governance', 
    category: 'Security',
    impact: 'Ensures regulatory compliance and data security'
  },
  'safety.moderation': { 
    description: 'Content safety moderation for user-generated content and AI outputs', 
    category: 'Security',
    impact: 'Protects users from inappropriate or harmful content'
  },
  'exports.enabled': { 
    description: 'Data export functionality for reports, contacts, and analytics', 
    category: 'Data',
    impact: 'Enables data portability and external analysis'
  },
  'retention.enabled': { 
    description: 'Data retention policies and automated cleanup for compliance', 
    category: 'Data',
    impact: 'Manages data lifecycle and storage costs'
  },
  'netfx.enabled': { 
    description: 'Network effects features for viral growth and user engagement', 
    category: 'Analytics',
    impact: 'Drives organic growth through user referrals'
  },
  'netfx.ab.enabled': { 
    description: 'Network effects A/B testing for optimizing viral mechanics', 
    category: 'Analytics',
    impact: 'Optimizes growth strategies and user acquisition'
  },
  'netfx.playbooks.enabled': { 
    description: 'Network effects playbooks and growth strategy templates', 
    category: 'Analytics',
    impact: 'Provides proven growth strategies and best practices'
  },
  'inbox.pro.enabled': { 
    description: 'Professional inbox features including advanced filtering and automation', 
    category: 'Communication',
    impact: 'Improves communication efficiency and organization'
  },
  'contacts.dedupe': { 
    description: 'Automatic contact deduplication to prevent duplicate entries', 
    category: 'Contacts',
    impact: 'Maintains clean contact database and prevents confusion'
  },
  'contacts.bulk': { 
    description: 'Bulk contact operations for importing, updating, and managing multiple contacts', 
    category: 'Contacts',
    impact: 'Saves time on large-scale contact management'
  },
  'brandrun.progressViz': { 
    description: 'Enhanced brand run progress visualization with charts and analytics', 
    category: 'Brand Run',
    impact: 'Better visibility into brand discovery progress'
  },
  'observability': { 
    description: 'System observability features including logging, monitoring, and debugging', 
    category: 'Monitoring',
    impact: 'Improves system reliability and troubleshooting'
  },
  'netfx.kmin': { 
    description: 'Minimum K value for network effects calculations (default: 10)', 
    category: 'Analytics',
    impact: 'Affects network effects algorithm sensitivity'
  },
  'netfx.dp.epsilon': { 
    description: 'Differential privacy epsilon value for data protection (default: 20)', 
    category: 'Analytics',
    impact: 'Balances data utility with privacy protection'
  },
};

export default function FeatureFlagsPage() {
  const [flagsData, setFlagsData] = useState<FlagInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process flags data
    const processedFlags: FlagInfo[] = [];
    
    Object.entries(flags).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle nested flags like contacts.dedupe
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          const fullKey = `${key}.${nestedKey}`;
                  const info = FLAG_DESCRIPTIONS[fullKey] || { description: 'No description available', category: 'Other', impact: 'No impact information available' };
        
        processedFlags.push({
          key: fullKey,
          value: nestedValue,
          source: 'default',
          description: info.description,
          category: info.category,
          impact: info.impact,
        });
        });
      } else {
        // Handle simple flags
        const info = FLAG_DESCRIPTIONS[key] || { description: 'No description available', category: 'Other', impact: 'No impact information available' };
        
        let source: 'env' | 'workspace' | 'default' = 'default';
        if (key.startsWith('NEXT_PUBLIC_')) {
          source = 'env';
        }

        processedFlags.push({
          key,
          value,
          source,
          description: info.description,
          category: info.category,
          impact: info.impact,
        });
      }
    });

    setFlagsData(processedFlags);
    setLoading(false);
  }, []);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'env':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'workspace':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'default':
        return 'text-gray-600 border-gray-200 bg-gray-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getValueDisplay = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getValueColor = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50';
    }
    return 'text-gray-600 border-gray-200 bg-gray-50';
  };

  const categories = [...new Set(flagsData.map(flag => flag.category))].sort();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Feature Flags" 
          subtitle="Current feature flag values and sources"
        />
        <div className="container-page">
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Feature Flags" 
        subtitle="Current feature flag values and sources"
      />
      
      {/* Future Enhancement Notice */}
      <div className="container-page">
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-sm">ℹ️</span>
            <span className="text-sm">
              <strong>RC Mode:</strong> This dashboard currently shows read-only flag values. 
              Future versions will include workspace-level flag overrides and editing capabilities.
            </span>
          </div>
        </Card>
      </div>
      
      <div className="container-page">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="p-4">
            <div className="text-sm text-[var(--muted-fg)]">Total Flags</div>
            <div className="text-2xl font-bold">{flagsData.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-[var(--muted-fg)]">Enabled</div>
            <div className="text-2xl font-bold text-green-600">
              {flagsData.filter(f => f.value === true).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-[var(--muted-fg)]">Categories</div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </Card>
        </div>

        {/* Feature Flags Table */}
        <Card className="p-6">
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">
                  {category}
                </h3>
                <div className="space-y-3">
                  {flagsData
                    .filter(flag => flag.category === category)
                    .map(flag => (
                      <div key={flag.key} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="text-sm font-mono bg-[var(--muted)]/20 px-2 py-1 rounded">
                              {flag.key}
                            </code>
                            <Badge className={getSourceColor(flag.source)}>
                              {flag.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--muted-fg)] mb-2">
                            {flag.description}
                          </p>
                          <p className="text-xs text-[var(--muted-fg)] bg-[var(--muted)]/10 px-2 py-1 rounded">
                            <span className="font-medium">Impact:</span> {flag.impact}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getValueColor(flag.value)}>
                            {getValueDisplay(flag.value)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Environment Info */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">Environment Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-[var(--muted-fg)] mb-2">Environment</div>
              <div className="font-mono text-sm bg-[var(--muted)]/20 px-3 py-2 rounded">
                {process.env.NODE_ENV || 'development'}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--muted-fg)] mb-2">Last Updated</div>
              <div className="font-mono text-sm bg-[var(--muted)]/20 px-3 py-2 rounded">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
