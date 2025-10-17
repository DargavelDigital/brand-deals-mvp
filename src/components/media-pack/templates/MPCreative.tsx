import React from 'react';

interface MPCreativeProps {
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

export default function MPCreative({ data }: { data: any }) {
  // Extract theme from data object (matches how other templates work)
  const theme = data.theme || { brandColor: '#8B5CF6', dark: false };
  // Creative color palette - BOLD & VIBRANT!
  const vividPurple = '#8B5CF6';
  const hotPink = '#EC4899';
  const amberGold = '#F59E0B';
  const emeraldGreen = '#10B981';
  const brightBlue = '#3B82F6';
  const darkGray = '#1F2937';
  const primarySocial = data.socials?.[0]; // Use first social platform
  
  // Add console logging for debugging
  console.log('🎨 MPCreative rendering with data:', {
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
        className="pdf-page bg-white shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '10mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header Section */}
        <div className="mb-4">
          {/* Creator Profile */}
          <div className="flex items-start gap-3 mb-3">
            {/* Headshot Placeholder */}
            <div 
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${vividPurple}, ${hotPink})`,
                borderColor: amberGold,
                minWidth: '48pt',
                minHeight: '48pt',
                transform: 'rotate(-5deg)'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <h1 
                className="font-bold mb-2"
                style={{ 
                  fontSize: '32pt',
                  lineHeight: '1.1',
                  background: `linear-gradient(135deg, ${vividPurple}, ${hotPink})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '800',
                  transform: 'rotate(-1deg)',
                  display: 'inline-block',
                  wordSpacing: 'normal'
                }}
              >
                {data.creator.name || 'Professional Creator'}
              </h1>
              <p 
                className="mb-2"
                style={{ 
                  fontSize: '18pt',
                  lineHeight: '1.3',
                  color: amberGold,
                  fontWeight: '700',
                  fontStyle: 'italic',
                  wordSpacing: 'normal'
                }}
              >
                {data.creator.tagline || 'Content Creator & Brand Partner'}
              </p>
              {data.creator.niche && data.creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.creator.niche.slice(0, 5).map((niche, index) => (
                    <span
                      key={index}
                      className="px-5 py-2.5 rounded-lg text-xs shadow-lg"
                      style={{
                        background: index % 3 === 0
                          ? `linear-gradient(90deg, ${vividPurple}, ${hotPink})`
                          : index % 3 === 1
                          ? `linear-gradient(90deg, ${amberGold}, ${hotPink})`
                          : `linear-gradient(90deg, ${emeraldGreen}, ${brightBlue})`,
                        color: '#FFFFFF',
                        fontWeight: '700',
                        transform: index % 3 === 0 ? 'rotate(-2deg)' : index % 3 === 1 ? 'rotate(1deg)' : 'rotate(-1deg)'
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
        <div className="mb-6">
          <h2 
            className="font-bold mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${vividPurple}, ${hotPink}, ${amberGold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Audience Reach
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Followers - Purple to Pink */}
            <div 
              className="p-4 rounded-2xl shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${vividPurple}20, ${hotPink}20)`,
                border: `2px solid ${vividPurple}`,
                transform: 'rotate(1deg)',
                boxShadow: `0 8px 24px rgba(139, 92, 246, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  background: `linear-gradient(135deg, ${vividPurple}, ${hotPink})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}
              >
                {formatNumber(primarySocial?.followers || 0)}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: '#64748B', textTransform: 'uppercase' }}
              >
                {primarySocial?.platform?.toUpperCase() || 'INSTAGRAM'} FOLLOWERS
              </div>
            </div>

            {/* Engagement Rate - Amber to Pink */}
            <div 
              className="p-4 rounded-2xl shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${amberGold}20, ${hotPink}20)`,
                border: `2px solid ${amberGold}`,
                transform: 'rotate(-1deg)',
                boxShadow: `0 8px 24px rgba(245, 158, 11, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  background: `linear-gradient(135deg, ${amberGold}, ${hotPink})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}
              >
                {formatEngagement(primarySocial?.engagementRate || 0)}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: '#64748B', textTransform: 'uppercase' }}
              >
                ENGAGEMENT RATE
              </div>
            </div>

            {/* Reach Rate - Green to Blue */}
            <div 
              className="p-4 rounded-2xl shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${emeraldGreen}20, ${brightBlue}20)`,
                border: `2px solid ${emeraldGreen}`,
                transform: 'rotate(1deg)',
                boxShadow: `0 8px 24px rgba(16, 185, 129, 0.3)`
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '48pt', 
                  background: `linear-gradient(135deg, ${emeraldGreen}, ${brightBlue})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}
              >
                {data.stats.reachRate || 'N/A'}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: '#64748B', textTransform: 'uppercase' }}
              >
                REACH RATE
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 
            className="font-bold mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${hotPink}, ${amberGold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            About
          </h2>
          <p 
            className="leading-relaxed"
            style={{ 
              fontSize: '12pt',
              lineHeight: '1.7',
              color: darkGray,
              fontWeight: '500'
            }}
          >
            {data.ai.elevatorPitch || 'Professional content creator specializing in engaging, high-quality content that drives results for brand partnerships.'}
          </p>
        </div>

        {/* Key Strengths */}
        {data.ai.highlights && data.ai.highlights.length > 0 && (
          <div className="mb-6">
            <h2 
              className="font-bold mb-3"
              style={{ 
                fontSize: '20pt',
                background: `linear-gradient(135deg, ${emeraldGreen}, ${brightBlue})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}
            >
              Key Strengths
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.ai.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div 
                    className="w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-lg"
                    style={{ 
                      background: index % 4 === 0 
                        ? vividPurple 
                        : index % 4 === 1 
                        ? hotPink 
                        : index % 4 === 2 
                        ? amberGold 
                        : emeraldGreen
                    }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      fontSize: '12pt',
                      lineHeight: '1.6',
                      color: darkGray,
                      fontWeight: '500'
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
        <div className="mb-6">
          <h2 
            className="font-bold mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${vividPurple}, ${amberGold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Audience Demographics
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {/* Age Distribution */}
            {data.audience?.age && data.audience.age.length > 0 && (
              <div className="text-center">
                {console.log('🎂 Age data for chart:', data.audience.age)}
                {data.audience.age.length === 1 ? (
                  // Special case: Single age group (100%) - show as solid circle
                  <div className="mb-2 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: vividPurple }}
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
          <div className="mb-6">
            <h2 
              className="font-bold mb-3"
              style={{ 
                fontSize: '20pt',
                background: `linear-gradient(135deg, ${hotPink}, ${vividPurple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}
            >
              Partnership Readiness
            </h2>
            <div 
              className="p-4 rounded-2xl shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${vividPurple}15, ${hotPink}15, ${amberGold}15)`,
                border: `2px solid ${hotPink}`,
                transform: 'rotate(-0.5deg)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  style={{ fontSize: '18pt', color: darkGray, fontWeight: '700' }}
                >
                  {data.brandFit.readiness || 'Professional Creator'}
                </span>
                {data.brandFit.estimatedCPM && (
                  <span 
                    style={{ 
                      fontSize: '20pt', 
                      background: `linear-gradient(135deg, ${vividPurple}, ${hotPink})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '800'
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
                      className="px-3 py-1.5 rounded-lg text-xs shadow-md"
                      style={{
                        background: index % 4 === 0
                          ? `linear-gradient(90deg, ${vividPurple}, ${hotPink})`
                          : index % 4 === 1
                          ? `linear-gradient(90deg, ${amberGold}, ${hotPink})`
                          : index % 4 === 2
                          ? `linear-gradient(90deg, ${emeraldGreen}, ${brightBlue})`
                          : `linear-gradient(90deg, ${hotPink}, ${amberGold})`,
                        color: '#FFFFFF',
                        fontWeight: '700'
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
        className="pdf-page bg-white shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '10mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl font-bold mb-6" 
          style={{ 
            fontSize: '28pt',
            background: `linear-gradient(135deg, ${vividPurple}, ${hotPink}, ${amberGold})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800',
            transform: 'rotate(-1deg)',
            display: 'inline-block'
          }}
        >
          Content Performance
        </h1>

        {/* Average Performance Stats */}
        <div 
          className="rounded-2xl p-6 mb-6 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${vividPurple}15, ${hotPink}15, ${amberGold}15)`,
            border: `3px solid transparent`,
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${vividPurple}, ${hotPink}, ${amberGold})`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${vividPurple}, ${amberGold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Average Performance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: vividPurple, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.avgLikes?.toLocaleString() || '0'}
              </div>
              <div className="text-sm font-bold" style={{ color: '#64748B', textTransform: 'uppercase' }}>AVERAGE LIKES</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: hotPink, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.avgComments || '0'}
              </div>
              <div className="text-sm font-bold" style={{ color: '#64748B', textTransform: 'uppercase' }}>AVG COMMENTS</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: amberGold, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.reachRate || '0'}%
              </div>
              <div className="text-sm font-bold" style={{ color: '#64748B', textTransform: 'uppercase' }}>REACH RATE</div>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="mb-6">
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${hotPink}, ${amberGold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Engagement Highlights
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: vividPurple }} />
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                {(data.stats?.engagement || 0)}% engagement rate
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: hotPink }} />
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                Consistent content performance
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: amberGold }} />
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                High audience interaction
              </span>
            </div>
          </div>
        </div>

        {/* Content Themes */}
        <div className="mb-6">
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${emeraldGreen}, ${brightBlue})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Content Themes
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.contentThemes && data.contentThemes.length > 0 ? (
              data.contentThemes.slice(0, 8).map((theme: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-4 py-2 rounded-xl text-sm shadow-lg"
                  style={{ 
                    background: idx % 5 === 0
                      ? `linear-gradient(135deg, ${hotPink}, ${amberGold})`
                      : idx % 5 === 1
                      ? `linear-gradient(135deg, ${vividPurple}, ${hotPink})`
                      : idx % 5 === 2
                      ? `linear-gradient(135deg, ${emeraldGreen}, ${brightBlue})`
                      : idx % 5 === 3
                      ? `linear-gradient(135deg, ${amberGold}, ${hotPink})`
                      : `linear-gradient(135deg, ${vividPurple}, ${amberGold})`,
                    color: '#FFFFFF',
                    fontWeight: '700',
                    transform: idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(0.5deg)'
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
                  className="px-4 py-2 rounded-xl text-sm shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${vividPurple}, ${hotPink})`,
                    color: '#FFFFFF',
                    fontWeight: '700'
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
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              background: `linear-gradient(135deg, ${amberGold}, ${vividPurple})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}
          >
            Audience Insights
          </h2>
          <div 
            className="rounded-2xl p-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${vividPurple}10, ${hotPink}10, ${amberGold}10, ${emeraldGreen}10)`,
              border: `2px solid ${hotPink}`
            }}
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold" style={{ color: darkGray }}>Total Followers:</span>
                <span className="ml-2" style={{ color: vividPurple, fontWeight: '800' }}>
                  {primarySocial?.followers?.toLocaleString() || '0'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray }}>Primary Age:</span>
                <span className="ml-2" style={{ color: hotPink, fontWeight: '800' }}>
                  {data.audience?.age?.[0]?.label || '25-34'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray }}>Top Markets:</span>
                <span className="ml-2" style={{ color: amberGold, fontWeight: '800' }}>
                  {data.audience?.geo?.slice(0, 3).map((g: any) => g.label).join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray }}>Est. CPM:</span>
                <span className="ml-2" style={{ color: emeraldGreen, fontWeight: '800' }}>
                  {data.brandFit?.estimatedCPM || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Brand Partnerships & Contact */}
      <div 
        className="pdf-page bg-white shadow-lg font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '10mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl font-bold mb-6" 
          style={{ 
            fontSize: '28pt',
            background: `linear-gradient(135deg, ${vividPurple}, ${hotPink}, ${amberGold})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}
        >
          Brand Partnerships
        </h1>

        {/* Target Brands */}
        {data.brands && data.brands.length > 0 ? (
          <div className="mb-8">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: '20pt',
                background: `linear-gradient(135deg, ${hotPink}, ${vividPurple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}
            >
              Brands I'm Targeting
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {data.brands.slice(0, 6).map((brand: any, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-2xl p-4 text-center shadow-xl"
                  style={{ 
                    border: `2px solid ${
                      idx % 6 === 0 ? vividPurple
                      : idx % 6 === 1 ? hotPink
                      : idx % 6 === 2 ? amberGold
                      : idx % 6 === 3 ? emeraldGreen
                      : idx % 6 === 4 ? brightBlue
                      : vividPurple
                    }`,
                    transform: idx % 2 === 0 ? 'rotate(0.5deg)' : 'rotate(-1deg)',
                    boxShadow: `0 8px 24px rgba(${idx % 3 === 0 ? '139, 92, 246' : idx % 3 === 1 ? '236, 72, 153' : '245, 158, 11'}, 0.2)`
                  }}
                >
                  <div className="text-xl font-bold mb-2" style={{ color: darkGray, fontWeight: '800' }}>
                    {brand.name}
                  </div>
                  <div className="text-sm font-bold" style={{ 
                    color: idx % 6 === 0 ? vividPurple
                      : idx % 6 === 1 ? hotPink
                      : idx % 6 === 2 ? amberGold
                      : idx % 6 === 3 ? emeraldGreen
                      : idx % 6 === 4 ? brightBlue
                      : vividPurple
                  }}>
                    {brand.industry || brand.domain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="mb-8 p-6 rounded-2xl text-center shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${vividPurple}15, ${hotPink}15, ${amberGold}15)`,
              border: `2px solid ${vividPurple}`
            }}
          >
            <p className="text-lg mb-4" style={{ color: darkGray, fontWeight: '700' }}>
              Ready to partner with brands in:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.brandFit?.idealIndustries?.slice(0, 6).map((industry: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-4 py-2 rounded-full text-sm shadow-lg"
                  style={{
                    background: idx % 4 === 0
                      ? `linear-gradient(90deg, ${vividPurple}, ${hotPink})`
                      : idx % 4 === 1
                      ? `linear-gradient(90deg, ${amberGold}, ${hotPink})`
                      : idx % 4 === 2
                      ? `linear-gradient(90deg, ${emeraldGreen}, ${brightBlue})`
                      : `linear-gradient(90deg, ${hotPink}, ${amberGold})`,
                    color: '#FFFFFF',
                    fontWeight: '700'
                  }}
                >
                  {industry}
                </span>
              )) || (
                <span style={{ color: '#64748B' }}>Various industries</span>
              )}
            </div>
          </div>
        )}

        {/* Key Contacts */}
        {data.contacts && data.contacts.length > 0 && (
          <div className="mb-8">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: '20pt',
                background: `linear-gradient(135deg, ${amberGold}, ${emeraldGreen})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
              }}
            >
              Key Contacts Identified
            </h2>
            <div className="space-y-3">
              {data.contacts.slice(0, 3).map((contact: any, idx: number) => (
                <div 
                  key={idx} 
                  className="pl-4 py-3 rounded-lg shadow-lg"
                  style={{ 
                    borderLeft: `4px solid ${
                      idx % 3 === 0 ? vividPurple
                      : idx % 3 === 1 ? hotPink
                      : amberGold
                    }`,
                    background: `linear-gradient(90deg, ${
                      idx % 3 === 0 ? vividPurple
                      : idx % 3 === 1 ? hotPink
                      : amberGold
                    }10, transparent)`
                  }}
                >
                  <div className="font-bold text-lg mb-1" style={{ color: darkGray, fontWeight: '800' }}>
                    {contact.name}
                  </div>
                  <div className="text-sm mb-2" style={{ 
                    color: idx % 3 === 0 ? vividPurple
                      : idx % 3 === 1 ? hotPink
                      : amberGold,
                    fontWeight: '700'
                  }}>
                    {contact.title}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold" style={{ color: darkGray }}>{contact.brandName}</span>
                    {contact.email && (
                      <>
                        <span className="mx-2" style={{ color: '#64748B' }}>•</span>
                        <span style={{ 
                          color: idx % 3 === 0 ? vividPurple
                            : idx % 3 === 1 ? hotPink
                            : amberGold,
                          fontWeight: '700'
                        }}>
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
          className="rounded-3xl p-8 text-center shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${vividPurple}, ${hotPink}, ${amberGold})`,
            transform: 'rotate(-0.5deg)'
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ 
              fontSize: '24pt',
              color: '#FFFFFF',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            Let's Create Together!
          </h2>
          <p className="text-lg mb-4" style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '14pt' }}>
            Ready to bring vibrant, creative energy to your brand. Let's make something amazing!
          </p>
          <div className="flex justify-center gap-10 text-base">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📧</span>
              <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '14pt' }}>
                {data.contact?.email || 'contact@example.com'}
              </span>
            </div>
            {primarySocial && (
              <div className="flex items-center gap-3">
                <span className="text-3xl">📱</span>
                <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '14pt' }}>
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
