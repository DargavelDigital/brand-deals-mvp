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
}

const FLAG_DESCRIPTIONS: Record<string, { description: string; category: string }> = {
  'ai.adapt.feedback': { description: 'AI adaptation feedback system', category: 'AI' },
  'pwa.enabled': { description: 'Progressive Web App features', category: 'Platform' },
  'push.enabled': { description: 'Push notification system', category: 'Platform' },
  'crm.light.enabled': { description: 'CRM lightweight mode', category: 'CRM' },
  'crm.reminders.enabled': { description: 'CRM reminder system', category: 'CRM' },
  'compliance.mode': { description: 'Compliance features', category: 'Security' },
  'safety.moderation': { description: 'Content safety moderation', category: 'Security' },
  'exports.enabled': { description: 'Data export functionality', category: 'Data' },
  'retention.enabled': { description: 'Data retention policies', category: 'Data' },
  'netfx.enabled': { description: 'Network effects features', category: 'Analytics' },
  'netfx.ab.enabled': { description: 'Network effects A/B testing', category: 'Analytics' },
  'netfx.playbooks.enabled': { description: 'Network effects playbooks', category: 'Analytics' },
  'inbox.pro.enabled': { description: 'Inbox professional features', category: 'Communication' },
  'contacts.dedupe': { description: 'Contact deduplication', category: 'Contacts' },
  'contacts.bulk': { description: 'Bulk contact operations', category: 'Contacts' },
  'brandrun.progressViz': { description: 'Brand run progress visualization', category: 'Brand Run' },
  'observability': { description: 'Observability features', category: 'Monitoring' },
};

export default function FeatureFlagsPage() {
  const [flagsData, setFlagsData] = useState<FlagInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process flags data
    const processedFlags: FlagInfo[] = Object.entries(flags).map(([key, value]) => {
      const info = FLAG_DESCRIPTIONS[key] || { description: 'No description available', category: 'Other' };
      
      // Determine source (simplified - in real app this would check workspace overrides)
      let source: 'env' | 'workspace' | 'default' = 'default';
      if (key.startsWith('NEXT_PUBLIC_')) {
        source = 'env';
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested flags like contacts.dedupe
        source = 'default';
      } else {
        source = 'default';
      }

      return {
        key,
        value,
        source,
        description: info.description,
        category: info.category,
      };
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
                          <p className="text-sm text-[var(--muted-fg)]">
                            {flag.description}
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
