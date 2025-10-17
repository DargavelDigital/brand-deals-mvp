import React from 'react';

interface MPEnergeticProps {
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

export default function MPEnergetic({ data }: { data: any }) {
  // Extract theme from data object (matches how other templates work)
  const theme = data.theme || { brandColor: '#F97316', dark: false };
  // Energetic color palette: Orange, Teal, Red
  const vibrantOrange = '#F97316';
  const energeticTeal = '#14B8A6';
  const boldRed = '#DC2626';
  const offWhite = '#FAFAFA';
  const darkGray = '#1F2937';
  const primarySocial = data.socials?.[0]; // Use first social platform
  
  // Add console logging for debugging
  console.log('⚡ MPEnergetic rendering with data:', {
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
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg"
              style={{ 
                borderColor: vibrantOrange,
                background: `linear-gradient(135deg, ${vibrantOrange}, ${boldRed})`,
                minWidth: '48pt',
                minHeight: '48pt',
                transform: 'rotate(-3deg)'
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
                  background: `linear-gradient(135deg, ${vibrantOrange}, ${boldRed})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}
              >
                {data.creator.name || 'PROFESSIONAL CREATOR'}
              </h1>
              <p 
                className="mb-2"
                style={{ 
                  fontSize: '18pt',
                  lineHeight: '1.3',
                  color: energeticTeal,
                  fontWeight: '700'
                }}
              >
                {data.creator.tagline || 'Content Creator & Brand Partner'}
              </p>
              {data.creator.niche && data.creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.creator.niche.slice(0, 5).map((niche, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg text-xs shadow-lg"
                      style={{
                        background: index % 3 === 0 
                          ? `linear-gradient(90deg, ${vibrantOrange}, ${boldRed})`
                          : index % 3 === 1
                          ? `linear-gradient(90deg, ${energeticTeal}, ${vibrantOrange})`
                          : `linear-gradient(90deg, ${boldRed}, ${energeticTeal})`,
                        color: '#FFFFFF',
                        fontWeight: '700',
                        transform: index % 2 === 0 ? 'rotate(-1deg)' : 'rotate(0.5deg)',
                        textTransform: 'uppercase'
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
              color: darkGray,
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            AUDIENCE REACH
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Followers */}
            <div 
              className="p-5 rounded-lg shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${vibrantOrange}10, ${energeticTeal}10)`,
                border: `3px solid ${vibrantOrange}`,
                transform: 'rotate(2deg)'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '48pt', color: vibrantOrange, fontWeight: '800' }}
              >
                {formatNumber(primarySocial?.followers || 0)}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: energeticTeal, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                {primarySocial?.platform?.toUpperCase() || 'INSTAGRAM'} FOLLOWERS
              </div>
            </div>

            {/* Engagement Rate */}
            <div 
              className="p-5 rounded-lg shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${energeticTeal}10, ${boldRed}10)`,
                border: `3px solid ${energeticTeal}`,
                transform: 'rotate(-3deg)'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '48pt', color: energeticTeal, fontWeight: '800' }}
              >
                {formatEngagement(primarySocial?.engagementRate || 0)}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: vibrantOrange, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                ENGAGEMENT RATE
              </div>
            </div>

            {/* Reach Rate */}
            <div 
              className="p-5 rounded-lg shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${boldRed}10, ${vibrantOrange}10)`,
                border: `3px solid ${boldRed}`,
                transform: 'rotate(1deg)'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '48pt', color: boldRed, fontWeight: '800' }}
              >
                {data.stats.reachRate || 'N/A'}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: energeticTeal, textTransform: 'uppercase', letterSpacing: '0.1em' }}
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
              color: darkGray,
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            ABOUT
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
                color: darkGray,
                fontWeight: '800',
                textTransform: 'uppercase'
              }}
            >
              KEY STRENGTHS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.ai.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span 
                    className="flex-shrink-0 text-lg"
                    style={{ color: vibrantOrange }}
                  >
                    ⚡
                  </span>
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
              color: darkGray,
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            AUDIENCE DEMOGRAPHICS
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Age Distribution */}
            {data.audience?.age && data.audience.age.length > 0 && (
              <div className="text-center">
                {console.log('🎂 Age data for chart:', data.audience.age)}
                {data.audience.age.length === 1 ? (
                  // Special case: Single age group (100%) - show as solid circle
                  <div className="mb-2 flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: vibrantOrange }}
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
                color: darkGray,
                fontWeight: '800',
                textTransform: 'uppercase'
              }}
            >
              PARTNERSHIP READINESS
            </h2>
            <div 
              className="p-5 rounded-lg shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${vibrantOrange}15, ${energeticTeal}15)`,
                border: `3px solid ${vibrantOrange}`,
                transform: 'rotate(-1deg)'
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
                    style={{ fontSize: '20pt', color: vibrantOrange, fontWeight: '800' }}
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
                        background: index % 2 === 0 
                          ? `linear-gradient(90deg, ${energeticTeal}, ${vibrantOrange})`
                          : `linear-gradient(90deg, ${vibrantOrange}, ${boldRed})`,
                        color: '#FFFFFF',
                        fontWeight: '700',
                        textTransform: 'uppercase'
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
            color: darkGray,
            fontWeight: '800',
            textTransform: 'uppercase',
            transform: 'rotate(-1deg)',
            display: 'inline-block'
          }}
        >
          CONTENT PERFORMANCE
        </h1>

        {/* Average Performance Stats */}
        <div 
          className="rounded-xl p-4 mb-6 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${vibrantOrange}10, ${energeticTeal}10)`,
            border: `2px solid ${energeticTeal}`,
            transform: 'rotate(0.5deg)'
          }}
        >
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              fontWeight: '800',
              color: darkGray,
              textTransform: 'uppercase'
            }}
          >
            CRUSHING IT!
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: vibrantOrange, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.avgLikes?.toLocaleString() || '0'}
              </div>
              <div className="text-sm font-bold" style={{ color: energeticTeal, textTransform: 'uppercase' }}>AVG LIKES</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: energeticTeal, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.avgComments || '0'}
              </div>
              <div className="text-sm font-bold" style={{ color: vibrantOrange, textTransform: 'uppercase' }}>AVG COMMENTS</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: boldRed, fontSize: '36pt', fontWeight: '800' }}>
                {data.stats?.reachRate || '0'}%
              </div>
              <div className="text-sm font-bold" style={{ color: energeticTeal, textTransform: 'uppercase' }}>REACH RATE</div>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="mb-6">
          <h2 
            className="mb-3"
            style={{ 
              fontSize: '20pt',
              fontWeight: '800',
              color: darkGray,
              textTransform: 'uppercase'
            }}
          >
            ENGAGEMENT POWER!
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                {(data.stats?.engagement || 0)}% DOMINATING ENGAGEMENT
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                CONSISTENT HIGH PERFORMANCE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="text-lg font-bold" style={{ color: darkGray }}>
                HIGHLY ENGAGED COMMUNITY
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
              fontWeight: '800',
              color: darkGray,
              textTransform: 'uppercase'
            }}
          >
            CONTENT THEMES
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.contentThemes && data.contentThemes.length > 0 ? (
              data.contentThemes.slice(0, 8).map((theme: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-4 py-2 rounded-lg text-sm shadow-lg"
                  style={{ 
                    background: idx % 3 === 0
                      ? `linear-gradient(90deg, ${vibrantOrange}, ${boldRed})`
                      : idx % 3 === 1
                      ? `linear-gradient(90deg, ${energeticTeal}, ${vibrantOrange})`
                      : `linear-gradient(90deg, ${boldRed}, ${energeticTeal})`,
                    color: '#FFFFFF',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    transform: idx % 2 === 0 ? 'rotate(-2deg)' : 'rotate(1deg)'
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
                  className="px-4 py-2 rounded-lg text-sm shadow-lg"
                  style={{ 
                    background: `linear-gradient(90deg, ${vibrantOrange}, ${boldRed})`,
                    color: '#FFFFFF',
                    fontWeight: '700',
                    textTransform: 'uppercase'
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
            className="mb-4"
            style={{ 
              fontSize: '24pt',
              fontWeight: '800',
              color: darkGray,
              textTransform: 'uppercase'
            }}
          >
            AUDIENCE INSIGHTS
          </h2>
          <div 
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${vibrantOrange}15, #FFFFFF)`,
              border: `3px solid ${energeticTeal}`
            }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold" style={{ color: darkGray, textTransform: 'uppercase' }}>FOLLOWERS:</span>
                <span className="ml-2" style={{ color: vibrantOrange, fontWeight: '800' }}>
                  {primarySocial?.followers?.toLocaleString() || '0'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray, textTransform: 'uppercase' }}>AGE:</span>
                <span className="ml-2" style={{ color: energeticTeal, fontWeight: '800' }}>
                  {data.audience?.age?.[0]?.label || '25-34'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray, textTransform: 'uppercase' }}>MARKETS:</span>
                <span className="ml-2" style={{ color: vibrantOrange, fontWeight: '800' }}>
                  {data.audience?.geo?.slice(0, 3).map((g: any) => g.label).join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-bold" style={{ color: darkGray, textTransform: 'uppercase' }}>CPM:</span>
                <span className="ml-2" style={{ color: energeticTeal, fontWeight: '800' }}>
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
            background: `linear-gradient(135deg, ${vibrantOrange}, ${energeticTeal})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800',
            textTransform: 'uppercase',
            transform: 'rotate(-1deg)',
            display: 'inline-block'
          }}
        >
          BRAND PARTNERSHIPS
        </h1>

        {/* Target Brands */}
        {data.brands && data.brands.length > 0 ? (
          <div className="mb-8">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: '20pt',
                fontWeight: '800',
                color: darkGray,
                textTransform: 'uppercase'
              }}
            >
              READY TO PARTNER
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {data.brands.slice(0, 6).map((brand: any, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-lg p-4 text-center shadow-xl"
                  style={{ 
                    background: '#FFFFFF',
                    border: `2px solid ${
                      idx % 3 === 0 ? vibrantOrange : idx % 3 === 1 ? energeticTeal : boldRed
                    }`,
                    transform: idx % 3 === 0 ? 'rotate(1deg)' : idx % 3 === 1 ? 'rotate(-1deg)' : 'rotate(0.5deg)'
                  }}
                >
                  <div 
                    className="text-xl font-bold mb-2"
                    style={{ 
                      color: darkGray,
                      fontWeight: '800',
                      fontSize: '18pt'
                    }}
                  >
                    {brand.name}
                  </div>
                  <div 
                    className="text-sm font-bold"
                    style={{ 
                      color: idx % 3 === 0 ? vibrantOrange : idx % 3 === 1 ? energeticTeal : boldRed,
                      textTransform: 'uppercase'
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
            className="mb-8 p-6 rounded-xl text-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${vibrantOrange}15, ${energeticTeal}15)`,
              border: `2px solid ${boldRed}`
            }}
          >
            <p 
              className="text-lg mb-4"
              style={{ color: darkGray, fontWeight: '700', textTransform: 'uppercase' }}
            >
              READY TO PARTNER WITH:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {data.brandFit?.idealIndustries?.slice(0, 6).map((industry: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-4 py-2 rounded-lg text-sm shadow-md"
                  style={{ 
                    background: `linear-gradient(90deg, ${vibrantOrange}, ${boldRed})`,
                    color: '#FFFFFF',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}
                >
                  {industry}
                </span>
              )) || (
                <span style={{ color: darkGray }}>Various industries</span>
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
                fontWeight: '800',
                color: darkGray,
                textTransform: 'uppercase'
              }}
            >
              KEY CONTACTS
            </h2>
            <div className="space-y-4">
              {data.contacts.slice(0, 3).map((contact: any, idx: number) => (
                <div 
                  key={idx} 
                  className="pl-6 py-4"
                  style={{ borderLeft: `4px solid ${vibrantOrange}` }}
                >
                  <div 
                    className="text-lg mb-1"
                    style={{ color: darkGray, fontWeight: '800', fontSize: '16pt' }}
                  >
                    {contact.name}
                  </div>
                  <div 
                    className="text-sm mb-2"
                    style={{ color: energeticTeal, fontWeight: '700' }}
                  >
                    {contact.title}
                  </div>
                  <div className="text-sm">
                    <span style={{ color: darkGray, fontWeight: '700' }}>{contact.brandName}</span>
                    {contact.email && (
                      <>
                        <span className="mx-2" style={{ color: vibrantOrange }}>•</span>
                        <span style={{ color: vibrantOrange, fontWeight: '700' }}>{contact.email}</span>
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
          className="rounded-2xl p-10 text-center shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${vibrantOrange}, ${boldRed})`,
            transform: 'rotate(-2deg)'
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{
              fontSize: '32pt',
              color: '#FFFFFF',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            LET'S GO! 🚀
          </h2>
          <p 
            className="text-lg mb-8"
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '14pt'
            }}
          >
            Ready to bring explosive growth to your brand! Let's create something AMAZING together.
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
