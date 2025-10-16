import React from 'react';

interface MPModernTechProps {
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

export default function MPModernTech({ data }: { data: any }) {
  // Extract theme from data object (matches how other templates work)
  const theme = data.theme || { brandColor: '#06B6D4', dark: true };
  // Modern Tech dark mode color palette
  const darkBg = '#0F172A'; // Very dark slate
  const cardBg = '#1E293B'; // Card backgrounds
  const neonCyan = '#06B6D4'; // Primary neon accent
  const techBlue = '#3B82F6'; // Secondary accent
  const techPurple = '#8B5CF6'; // Tertiary accent
  const lightText = '#F8FAFC'; // Main text
  const mutedText = '#94A3B8'; // Labels/muted
  const borderColor = '#334155'; // Dividers
  const primarySocial = data.socials?.[0]; // Use first social platform
  
  // Add console logging for debugging
  console.log('🚀 MPModernTech rendering with data:', {
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
    <div id="media-pack-preview" className="space-y-4">
      {/* Page 1: Hero & Overview */}
      <div 
        className="pdf-page shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '12mm',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: darkBg,
          color: lightText,
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Header Section */}
        <div className="mb-8">
          {/* Creator Profile */}
          <div className="flex items-start gap-6 mb-6">
            {/* Headshot Placeholder */}
            <div 
              className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
              style={{ 
                borderColor: neonCyan,
                backgroundColor: cardBg,
                minWidth: '48pt',
                minHeight: '48pt',
                boxShadow: `0 0 20px rgba(6, 182, 212, 0.5)`
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill={neonCyan}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <h1 
                className="font-bold mb-2"
                style={{ 
                  fontSize: '28pt',
                  lineHeight: '1.2',
                  color: neonCyan,
                  fontWeight: '700',
                  textShadow: `0 0 20px rgba(6, 182, 212, 0.8)`,
                  letterSpacing: '0.02em',
                  borderBottom: `2px solid ${neonCyan}`,
                  paddingBottom: '8px'
                }}
              >
                {data.creator.name || 'Professional Creator'}
              </h1>
              <p 
                className="mb-2"
                style={{ 
                  fontSize: '16pt',
                  lineHeight: '1.3',
                  color: techBlue,
                  fontWeight: '500'
                }}
              >
                {data.creator.tagline || 'Content Creator & Brand Partner'}
              </p>
              {data.creator.niche && data.creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.creator.niche.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs"
                      style={{
                        backgroundColor: cardBg,
                        color: neonCyan,
                        border: `1px solid ${neonCyan}`,
                        fontFamily: "'Courier New', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '10pt'
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
              fontSize: '20pt',
              color: neonCyan,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderLeft: `4px solid ${neonCyan}`,
              paddingLeft: '16px'
            }}
          >
            AUDIENCE REACH
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Followers */}
            <div 
              className="p-5 rounded-lg"
              style={{ 
                backgroundColor: cardBg,
                border: `2px solid ${neonCyan}`,
                boxShadow: `0 0 20px rgba(6, 182, 212, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  color: neonCyan,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: '700',
                  textShadow: `0 0 10px rgba(6, 182, 212, 0.8)`
                }}
              >
                {formatNumber(primarySocial?.followers || 0)}
              </div>
              <div 
                className="text-xs font-medium"
                style={{ 
                  color: mutedText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'system-ui'
                }}
              >
                {primarySocial?.platform?.toUpperCase() || 'INSTAGRAM'} FOLLOWERS
              </div>
            </div>

            {/* Engagement Rate */}
            <div 
              className="p-5 rounded-lg"
              style={{ 
                backgroundColor: cardBg,
                border: `2px solid ${techPurple}`,
                boxShadow: `0 0 20px rgba(139, 92, 246, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  color: techPurple,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: '700',
                  textShadow: `0 0 10px rgba(139, 92, 246, 0.8)`
                }}
              >
                {formatEngagement(primarySocial?.engagementRate || 0)}
              </div>
              <div 
                className="text-xs font-medium"
                style={{ 
                  color: mutedText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'system-ui'
                }}
              >
                ENGAGEMENT RATE
              </div>
            </div>

            {/* Reach Rate */}
            <div 
              className="p-5 rounded-lg"
              style={{ 
                backgroundColor: cardBg,
                border: `2px solid ${techBlue}`,
                boxShadow: `0 0 20px rgba(59, 130, 246, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  color: techBlue,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: '700',
                  textShadow: `0 0 10px rgba(59, 130, 246, 0.8)`
                }}
              >
                {data.stats.reachRate || 'N/A'}
              </div>
              <div 
                className="text-xs font-medium"
                style={{ 
                  color: mutedText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'system-ui'
                }}
              >
                REACH RATE
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h2 
            className="mb-4"
            style={{ 
              fontSize: '20pt',
              color: neonCyan,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderLeft: `4px solid ${neonCyan}`,
              paddingLeft: '16px'
            }}
          >
            About
          </h2>
          <p 
            className="leading-relaxed"
            style={{ 
              fontSize: '12pt',
              lineHeight: '1.7',
              color: lightText,
              fontWeight: '400'
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
                    style={{ 
                      backgroundColor: neonCyan,
                      boxShadow: `0 0 8px rgba(6, 182, 212, 0.8)`
                    }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      fontSize: '12pt',
                      lineHeight: '1.6',
                      color: lightText,
                      fontWeight: '400'
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
            className="mb-4"
            style={{ 
              fontSize: '20pt',
              color: neonCyan,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderLeft: `4px solid ${neonCyan}`,
              paddingLeft: '16px'
            }}
          >
            Audience Demographics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Age Distribution */}
            {data.audience?.age && data.audience.age.length > 0 && (
              <div className="text-center">
                {console.log('🎂 Age data for chart:', data.audience.age)}
                {data.audience.age.length === 1 ? (
                  // Special case: Single age group (100%) - show as solid circle
                  <div className="mb-2 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: brandColor }}
                    >
                      100%
                    </div>
                    <div className="mt-3 text-xs font-medium" style={{ color: '#374151' }}>
                      {data.audience.age[0].label}
                    </div>
                  </div>
                ) : (
                  // Multiple age groups: Use pie chart
                  <div className="mb-2">
                    <PieChart data={data.audience.age} size={80} />
                  </div>
                )}
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
              className="p-5 rounded-lg"
              style={{ 
                backgroundColor: cardBg,
                border: `2px solid ${neonCyan}`,
                boxShadow: `0 0 20px rgba(6, 182, 212, 0.3)`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  style={{ 
                    fontSize: '16pt', 
                    color: lightText,
                    fontWeight: '600'
                  }}
                >
                  {data.brandFit.readiness || 'Professional Creator'}
                </span>
                {data.brandFit.estimatedCPM && (
                  <span 
                    style={{ 
                      fontSize: '18pt', 
                      color: neonCyan,
                      fontFamily: "'Courier New', monospace",
                      fontWeight: '700',
                      textShadow: `0 0 10px rgba(6, 182, 212, 0.8)`
                    }}
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
                      className="px-3 py-1 text-xs"
                      style={{
                        backgroundColor: darkBg,
                        color: index % 2 === 0 ? neonCyan : techPurple,
                        border: `1px solid ${index % 2 === 0 ? neonCyan : techPurple}`,
                        fontFamily: "'Courier New', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
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

      {/* Page 2: Content Performance & Engagement */}
      <div 
        className="pdf-page shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '12mm',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: darkBg,
          color: lightText,
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl font-bold mb-8" 
          style={{ 
            color: neonCyan,
            fontSize: '28pt',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textShadow: `0 0 20px rgba(6, 182, 212, 0.8)`
          }}
        >
          Content Performance
        </h1>

        {/* Average Performance Stats */}
        <div 
          className="rounded-xl p-6 mb-8"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`
          }}
        >
          <h2 
            className="mb-6"
            style={{ 
              fontSize: '18pt',
              fontWeight: '700',
              color: techPurple,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            AVERAGE PERFORMANCE
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-2" 
                style={{ 
                  color: neonCyan,
                  fontSize: '36pt',
                  fontFamily: "'Courier New', monospace",
                  textShadow: `0 0 10px rgba(6, 182, 212, 0.8)`
                }}
              >
                {data.stats?.avgLikes?.toLocaleString() || '0'}
              </div>
              <div className="text-sm" style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AVG LIKES
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-2" 
                style={{ 
                  color: techPurple,
                  fontSize: '36pt',
                  fontFamily: "'Courier New', monospace",
                  textShadow: `0 0 10px rgba(139, 92, 246, 0.8)`
                }}
              >
                {data.stats?.avgComments || '0'}
              </div>
              <div className="text-sm" style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AVG COMMENTS
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-2" 
                style={{ 
                  color: techBlue,
                  fontSize: '36pt',
                  fontFamily: "'Courier New', monospace",
                  textShadow: `0 0 10px rgba(59, 130, 246, 0.8)`
                }}
              >
                {data.stats?.reachRate || '0'}%
              </div>
              <div className="text-sm" style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                REACH RATE
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="mb-8">
          <h2 
            className="mb-4"
            style={{ 
              fontSize: '20pt',
              color: neonCyan,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderLeft: `4px solid ${neonCyan}`,
              paddingLeft: '16px'
            }}
          >
            ENGAGEMENT HIGHLIGHTS
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: neonCyan,
                  boxShadow: `0 0 8px rgba(6, 182, 212, 0.8)`
                }} 
              />
              <span className="text-base" style={{ color: lightText, fontWeight: '500' }}>
                {(data.stats?.engagement || 0)}% engagement rate
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: techPurple,
                  boxShadow: `0 0 8px rgba(139, 92, 246, 0.8)`
                }} 
              />
              <span className="text-base" style={{ color: lightText, fontWeight: '500' }}>
                Consistent content performance
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: techBlue,
                  boxShadow: `0 0 8px rgba(59, 130, 246, 0.8)`
                }} 
              />
              <span className="text-base" style={{ color: lightText, fontWeight: '500' }}>
                High audience interaction
              </span>
            </div>
          </div>
        </div>

        {/* Content Themes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Content Themes</h2>
          <div className="flex flex-wrap gap-3">
            {data.contentThemes && data.contentThemes.length > 0 ? (
              data.contentThemes.map((theme: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 text-xs"
                  style={{ 
                    backgroundColor: cardBg,
                    color: idx % 2 === 0 ? neonCyan : techPurple,
                    border: `1px solid ${idx % 2 === 0 ? neonCyan : techPurple}`,
                    fontFamily: "'Courier New', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {theme}
                </span>
              ))
            ) : (
              // Fallback to niche if no content themes
              data.creator?.niche?.map((niche: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 text-xs"
                  style={{ 
                    backgroundColor: cardBg,
                    color: neonCyan,
                    border: `1px solid ${neonCyan}`,
                    fontFamily: "'Courier New', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {niche}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Audience Insights */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Audience Insights</h2>
          <div 
            className="rounded-xl p-6"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`
            }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10pt' }}
                >
                  FOLLOWERS:
                </span>
                <span 
                  className="ml-2"
                  style={{ color: neonCyan, fontWeight: '700', fontFamily: "'Courier New', monospace" }}
                >
                  {primarySocial?.followers?.toLocaleString() || '0'}
                </span>
              </div>
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10pt' }}
                >
                  AGE:
                </span>
                <span 
                  className="ml-2"
                  style={{ color: techPurple, fontWeight: '700', fontFamily: "'Courier New', monospace" }}
                >
                  {data.audience?.age?.[0]?.label || '25-34'}
                </span>
              </div>
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10pt' }}
                >
                  MARKETS:
                </span>
                <span 
                  className="ml-2"
                  style={{ color: techBlue, fontWeight: '700' }}
                >
                  {data.audience?.geo?.slice(0, 3).map((g: any) => g.label).join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10pt' }}
                >
                  CPM:
                </span>
                <span 
                  className="ml-2"
                  style={{ color: neonCyan, fontWeight: '700', fontFamily: "'Courier New', monospace" }}
                >
                  {data.brandFit?.estimatedCPM || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Brand Partnerships & Contact */}
      <div 
        className="pdf-page shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '12mm',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: darkBg,
          color: lightText,
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl font-bold mb-8" 
          style={{ 
            color: neonCyan,
            fontSize: '28pt',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textShadow: `0 0 20px rgba(6, 182, 212, 0.8)`
          }}
        >
          Brand Partnerships
        </h1>

        {/* Target Brands */}
        {data.brands && data.brands.length > 0 ? (
          <div className="mb-12">
            <h2 
              className="mb-6"
              style={{ 
                fontSize: '20pt',
                color: neonCyan,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderLeft: `4px solid ${neonCyan}`,
                paddingLeft: '16px'
              }}
            >
              TARGET BRANDS
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {data.brands.slice(0, 6).map((brand: any, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-lg p-5 text-center"
                  style={{ 
                    backgroundColor: cardBg,
                    border: `2px solid ${borderColor}`,
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`,
                    transition: 'all 0.3s',
                  }}
                >
                  <div 
                    className="text-xl font-bold mb-2"
                    style={{ 
                      color: lightText,
                      fontWeight: '700'
                    }}
                  >
                    {brand.name}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ 
                      color: neonCyan,
                      textTransform: 'uppercase',
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: '0.05em'
                    }}
                  >
                    {brand.industry || brand.domain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="mb-12 p-8 rounded-xl text-center"
            style={{
              backgroundColor: cardBg,
              border: `2px solid ${neonCyan}`
            }}
          >
            <p 
              className="text-lg mb-4"
              style={{ color: lightText, fontWeight: '600', textTransform: 'uppercase' }}
            >
              READY TO PARTNER WITH:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.brandFit?.idealIndustries?.slice(0, 6).map((industry: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 text-xs"
                  style={{ 
                    backgroundColor: darkBg,
                    color: idx % 2 === 0 ? neonCyan : techPurple,
                    border: `1px solid ${idx % 2 === 0 ? neonCyan : techPurple}`,
                    fontFamily: "'Courier New', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {industry}
                </span>
              )) || (
                <span style={{ color: mutedText }}>Various industries</span>
              )}
            </div>
          </div>
        )}

        {/* Key Contacts */}
        {data.contacts && data.contacts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Key Contacts Identified</h2>
            <div className="space-y-4">
              {data.contacts.slice(0, 3).map((contact: any, idx: number) => (
                <div 
                  key={idx} 
                  className="pl-6 py-4"
                  style={{ 
                    borderLeft: `4px solid ${neonCyan}`,
                    boxShadow: `-4px 0 10px rgba(6, 182, 212, 0.3)`
                  }}
                >
                  <div 
                    className="text-lg mb-1"
                    style={{ color: lightText, fontWeight: '700' }}
                  >
                    {contact.name}
                  </div>
                  <div 
                    className="text-sm mb-2"
                    style={{ color: techBlue, fontWeight: '500' }}
                  >
                    {contact.title}
                  </div>
                  <div className="text-sm">
                    <span style={{ color: lightText, fontWeight: '600' }}>{contact.brandName}</span>
                    {contact.email && (
                      <>
                        <span className="mx-2" style={{ color: mutedText }}>•</span>
                        <span 
                          style={{ 
                            color: neonCyan,
                            fontFamily: "'Courier New', monospace",
                            fontWeight: '600'
                          }}
                        >
                          {contact.email}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div 
          className="rounded-2xl p-10 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${cardBg}, ${darkBg})`,
            border: `2px solid ${neonCyan}`,
            boxShadow: `0 0 40px rgba(6, 182, 212, 0.5)`
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{
              fontSize: '28pt',
              color: neonCyan,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: `0 0 20px rgba(6, 182, 212, 1)`
            }}
          >
            LET'S COLLABORATE
          </h2>
          <p 
            className="text-lg mb-8"
            style={{
              color: lightText,
              fontWeight: '500',
              fontSize: '12pt'
            }}
          >
            Ready to bring innovative tech solutions to your brand. Let's build something extraordinary.
          </p>
          <div className="flex justify-center gap-10 text-base">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <span 
                style={{ 
                  color: neonCyan,
                  fontWeight: '700',
                  fontFamily: "'Courier New', monospace"
                }}
              >
                {data.contact?.email || 'contact@example.com'}
              </span>
            </div>
            {primarySocial && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <span 
                  style={{ 
                    color: techPurple,
                    fontWeight: '700',
                    fontFamily: "'Courier New', monospace"
                  }}
                >
                  @{data.creator?.name || primarySocial.platform}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
