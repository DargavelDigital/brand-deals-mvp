import React from 'react';

interface MPProfessionalProps {
  data: {
    creator: {
      name: string;
      tagline: string;
      niche: string[];
      location?: string;
    };
    socials: Array<{
      platform: string;
      followers: number;
      engagementRate: number;
    }>;
    stats: {
      avgLikes: number;
      avgComments: number;
      reachRate: number;
      engagement: number;
    };
    audience: {
      age: Array<{ label: string; value: number }>;
      gender: Array<{ label: string; value: number }>;
      geo: Array<{ label: string; value: number }>;
    };
    brandFit: {
      idealIndustries: string[];
      brandTypes: string[];
      estimatedCPM: string;
      readiness: string;
    };
    ai: {
      elevatorPitch: string;
      highlights: string[];
    };
    brands: Array<{
      id: string;
      name: string;
      domain: string;
    }>;
    contacts: Array<{
      name: string;
      email: string;
      title: string;
      brandName: string;
    }>;
  };
  theme: {
    brandColor: string;
    dark: boolean;
  };
}

// Simple SVG Pie Chart Component
const PieChart: React.FC<{ data: Array<{ label: string; value: number }>; size?: number }> = ({ 
  data, 
  size = 60 
}) => {
  const radius = (size - 4) / 2;
  const center = size / 2;
  let cumulativePercentage = 0;

  const segments = data.map((item, index) => {
    const percentage = item.value * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const color = colors[index % colors.length];
    
    return (
      <path
        key={index}
        d={pathData}
        fill={color}
        stroke="white"
        strokeWidth="0.5"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-2">
        {segments}
      </svg>
      <div className="text-xs space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ 
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] 
              }}
            />
            <span>{item.label}: {Math.round(item.value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Bar Chart Component
const BarChart: React.FC<{ data: Array<{ label: string; value: number }>; maxWidth?: number }> = ({ 
  data, 
  maxWidth = 120 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="text-xs w-12 text-right">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="text-xs w-8 text-right">{Math.round(item.value * 100)}%</div>
        </div>
      ))}
    </div>
  );
};

export default function MPProfessional({ data }: { data: any }) {
  // Extract theme from data object (matches how other templates work)
  const theme = data.theme || { brandColor: '#3b82f6', dark: false };
  const brandColor = theme.brandColor || '#3b82f6';
  const primarySocial = data.socials?.[0]; // Use first social platform
  
  // Add console logging for debugging
  console.log('🎨 MPProfessional rendering with data:', {
    hasCreator: !!data.creator,
    hasStats: !!data.stats,
    hasBrandFit: !!data.brandFit,
    hasSocials: !!data.socials,
    theme: theme
  });

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatEngagement = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div 
      className="bg-white font-sans" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        aspectRatio: '210/297',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Page 1: Hero & Overview */}
      <div className="page p-12" style={{ minHeight: '297mm' }}>
        {/* Header Section */}
        <div className="mb-8">
          {/* Creator Profile */}
          <div className="flex items-start gap-6 mb-6">
            {/* Headshot Placeholder */}
            <div 
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-gray-400 bg-gray-100"
              style={{ 
                borderColor: brandColor,
                minWidth: '48pt',
                minHeight: '48pt'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <h1 
                className="font-bold mb-2"
                style={{ 
                  fontSize: '28pt',
                  lineHeight: '1.2',
                  color: '#1f2937'
                }}
              >
                {data.creator.name || 'Professional Creator'}
              </h1>
              <p 
                className="mb-2"
                style={{ 
                  fontSize: '18pt',
                  lineHeight: '1.3',
                  color: brandColor,
                  fontWeight: '600'
                }}
              >
                {data.creator.tagline || 'Content Creator & Brand Partner'}
              </p>
              {data.creator.niche && data.creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.creator.niche.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${brandColor}20`,
                        color: brandColor,
                        border: `1px solid ${brandColor}40`
                      }}
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: '18pt',
              color: '#1f2937'
            }}
          >
            Audience Reach
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Followers */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${brandColor}10`,
                borderColor: `${brandColor}30`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '24pt', color: brandColor }}
              >
                {formatNumber(primarySocial?.followers || 0)}
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#6b7280' }}
              >
                {primarySocial?.platform?.toUpperCase() || 'INSTAGRAM'} Followers
              </div>
            </div>

            {/* Engagement Rate */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${brandColor}10`,
                borderColor: `${brandColor}30`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '24pt', color: brandColor }}
              >
                {formatEngagement(primarySocial?.engagementRate || 0)}
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#6b7280' }}
              >
                Engagement Rate
              </div>
            </div>

            {/* Reach Rate */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${brandColor}10`,
                borderColor: `${brandColor}30`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '24pt', color: brandColor }}
              >
                {data.stats.reachRate || 'N/A'}
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#6b7280' }}
              >
                Reach Rate
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: '18pt',
              color: '#1f2937'
            }}
          >
            About
          </h2>
          <p 
            className="leading-relaxed"
            style={{ 
              fontSize: '12pt',
              lineHeight: '1.6',
              color: '#374151'
            }}
          >
            {data.ai.elevatorPitch || 'Professional content creator specializing in engaging, high-quality content that drives results for brand partnerships.'}
          </p>
        </div>

        {/* Key Strengths */}
        {data.ai.highlights && data.ai.highlights.length > 0 && (
          <div className="mb-8">
            <h2 
              className="font-bold mb-4"
              style={{ 
                fontSize: '18pt',
                color: '#1f2937'
              }}
            >
              Key Strengths
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.ai.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: brandColor }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      fontSize: '12pt',
                      lineHeight: '1.5',
                      color: '#374151'
                    }}
                  >
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audience Demographics Preview */}
        <div className="mb-8">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: '18pt',
              color: '#1f2937'
            }}
          >
            Audience Demographics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Age Distribution */}
            {data.audience.age && data.audience.age.length > 0 && (
              <div className="text-center">
                <div className="mb-2">
                  <PieChart data={data.audience.age} size={80} />
                </div>
                <h3 
                  className="font-semibold text-sm"
                  style={{ color: '#374151' }}
                >
                  Age Distribution
                </h3>
              </div>
            )}

            {/* Gender Split */}
            {data.audience.gender && data.audience.gender.length > 0 && (
              <div className="text-center">
                <div className="mb-2">
                  <PieChart data={data.audience.gender} size={80} />
                </div>
                <h3 
                  className="font-semibold text-sm"
                  style={{ color: '#374151' }}
                >
                  Gender Split
                </h3>
              </div>
            )}

            {/* Geographic */}
            {data.audience.geo && data.audience.geo.length > 0 && (
              <div>
                <h3 
                  className="font-semibold text-sm mb-3 text-center"
                  style={{ color: '#374151' }}
                >
                  Top Locations
                </h3>
                <BarChart data={data.audience.geo.slice(0, 3)} />
              </div>
            )}
          </div>
        </div>

        {/* Brand Partnership Readiness */}
        {data.brandFit && (
          <div className="mb-8">
            <h2 
              className="font-bold mb-4"
              style={{ 
                fontSize: '18pt',
                color: '#1f2937'
              }}
            >
              Partnership Readiness
            </h2>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${brandColor}10`,
                borderColor: `${brandColor}30`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="font-semibold"
                  style={{ fontSize: '14pt', color: '#1f2937' }}
                >
                  {data.brandFit.readiness || 'Professional Creator'}
                </span>
                {data.brandFit.estimatedCPM && (
                  <span 
                    className="font-bold"
                    style={{ fontSize: '14pt', color: brandColor }}
                  >
                    {data.brandFit.estimatedCPM}
                  </span>
                )}
              </div>
              {data.brandFit.idealIndustries && data.brandFit.idealIndustries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.brandFit.idealIndustries.slice(0, 4).map((industry, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: `${brandColor}20`,
                        color: brandColor
                      }}
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
