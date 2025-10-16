import React from 'react';

interface MPMinimalProps {
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

export default function MPMinimal({ data }: { data: any }) {
  // Extract theme from data object (matches how other templates work)
  const theme = data.theme || { brandColor: '#10B981', dark: false };
  // Minimal color palette: Charcoal, Sage Green, Light Gray
  const accentColor = theme.brandColor || '#10B981'; // Sage Green or custom
  const charcoal = '#4A5568';
  const lightGray = '#F7FAFC';
  const primarySocial = data.socials?.[0]; // Use first social platform
  
  // Add console logging for debugging
  console.log('⚪ MPMinimal rendering with data:', {
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
        className="pdf-page bg-white shadow-sm font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '16mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header Section */}
        <div className="mb-8">
          {/* Creator Profile */}
          <div className="flex items-start gap-6 mb-6">
            {/* Headshot Placeholder */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-md"
              style={{ 
                backgroundColor: lightGray,
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
                  color: charcoal,
                  fontWeight: '600'
                }}
              >
                {data.creator.name || 'Professional Creator'}
              </h1>
              <p 
                className="mb-2"
                style={{ 
                  fontSize: '16pt',
                  lineHeight: '1.4',
                  color: accentColor,
                  fontWeight: '400'
                }}
              >
                {data.creator.tagline || 'Content Creator & Brand Partner'}
              </p>
              {data.creator.niche && data.creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.creator.niche.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${accentColor}10`,
                        color: accentColor
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
        <div className="mb-12">
          <h2 
            className="mb-6"
            style={{ 
              fontSize: '20pt',
              color: charcoal,
              fontWeight: '600'
            }}
          >
            Audience Reach
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {/* Followers */}
            <div 
              className="p-6 rounded-xl shadow-md"
              style={{ 
                backgroundColor: '#FFFFFF'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '32pt', color: accentColor, fontWeight: '600' }}
              >
                {formatNumber(primarySocial?.followers || 0)}
              </div>
              <div 
                className="text-sm"
                style={{ color: charcoal, fontWeight: '400' }}
              >
                {primarySocial?.platform?.toUpperCase() || 'INSTAGRAM'} Followers
              </div>
            </div>

            {/* Engagement Rate */}
            <div 
              className="p-6 rounded-xl shadow-md"
              style={{ 
                backgroundColor: '#FFFFFF'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '32pt', color: accentColor, fontWeight: '600' }}
              >
                {formatEngagement(primarySocial?.engagementRate || 0)}
              </div>
              <div 
                className="text-sm"
                style={{ color: charcoal, fontWeight: '400' }}
              >
                Engagement Rate
              </div>
            </div>

            {/* Reach Rate */}
            <div 
              className="p-6 rounded-xl shadow-md"
              style={{ 
                backgroundColor: '#FFFFFF'
              }}
            >
              <div 
                className="font-bold mb-1"
                style={{ fontSize: '32pt', color: accentColor, fontWeight: '600' }}
              >
                {data.stats.reachRate || 'N/A'}
              </div>
              <div 
                className="text-sm"
                style={{ color: charcoal, fontWeight: '400' }}
              >
                Reach Rate
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-16">
          <h2 
            className="mb-6"
            style={{ 
              fontSize: '20pt',
              color: charcoal,
              fontWeight: '600'
            }}
          >
            About
          </h2>
          <p 
            className="leading-relaxed"
            style={{ 
              fontSize: '12pt',
              lineHeight: '1.8',
              color: charcoal,
              fontWeight: '400'
            }}
          >
            {data.ai.elevatorPitch || 'Professional content creator specializing in engaging, high-quality content that drives results for brand partnerships.'}
          </p>
        </div>

        {/* Key Strengths */}
        {data.ai.highlights && data.ai.highlights.length > 0 && (
          <div className="mb-16">
            <h2 
              className="mb-6"
              style={{ 
                fontSize: '20pt',
                color: charcoal,
                fontWeight: '600'
              }}
            >
              Key Strengths
            </h2>
            <div className="space-y-4">
              {data.ai.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      fontSize: '12pt',
                      lineHeight: '1.7',
                      color: charcoal,
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
        <div className="mb-16">
          <h2 
            className="mb-6"
            style={{ 
              fontSize: '20pt',
              color: charcoal,
              fontWeight: '600'
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
          <div className="mb-16">
            <h2 
              className="mb-6"
              style={{ 
                fontSize: '20pt',
                color: charcoal,
                fontWeight: '600'
              }}
            >
              Partnership Readiness
            </h2>
            <div 
              className="p-6 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: lightGray
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span 
                  style={{ fontSize: '16pt', color: charcoal, fontWeight: '600' }}
                >
                  {data.brandFit.readiness || 'Professional Creator'}
                </span>
                {data.brandFit.estimatedCPM && (
                  <span 
                    style={{ fontSize: '16pt', color: accentColor, fontWeight: '600' }}
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
                      className="px-3 py-1.5 rounded-full text-xs"
                      style={{
                        backgroundColor: `${accentColor}10`,
                        color: accentColor,
                        fontWeight: '500'
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
        className="pdf-page bg-white shadow-sm font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '16mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <h1 
          className="text-3xl mb-12" 
          style={{ 
            fontSize: '28pt',
            color: charcoal,
            fontWeight: '600'
          }}
        >
          Content Performance
        </h1>

        {/* Average Performance Stats */}
        <div 
          className="rounded-xl p-8 mb-12 shadow-sm"
          style={{ backgroundColor: lightGray }}
        >
          <h2 
            className="mb-6"
            style={{ 
              fontSize: '20pt',
              color: charcoal,
              fontWeight: '600'
            }}
          >
            Average Performance
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2" style={{ color: accentColor, fontWeight: '600', fontSize: '32pt' }}>
                {data.stats?.avgLikes?.toLocaleString() || '0'}
              </div>
              <div className="text-sm" style={{ color: charcoal, fontWeight: '400' }}>Average Likes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2" style={{ color: accentColor, fontWeight: '600', fontSize: '32pt' }}>
                {data.stats?.avgComments || '0'}
              </div>
              <div className="text-sm" style={{ color: charcoal, fontWeight: '400' }}>Average Comments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2" style={{ color: accentColor, fontWeight: '600', fontSize: '32pt' }}>
                {data.stats?.reachRate || '0'}%
              </div>
              <div className="text-sm" style={{ color: charcoal, fontWeight: '400' }}>Reach Rate</div>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="mb-12">
          <h2 
            className="mb-6"
            style={{ fontSize: '20pt', color: charcoal, fontWeight: '600' }}
          >
            Engagement Highlights
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-base" style={{ color: charcoal }}>{(data.stats?.engagement || 0)}% engagement rate</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-base" style={{ color: charcoal }}>Consistent content performance</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-base" style={{ color: charcoal }}>High audience interaction</span>
            </div>
          </div>
        </div>

        {/* Content Themes */}
        <div className="mb-12">
          <h2 
            className="mb-6"
            style={{ fontSize: '20pt', color: charcoal, fontWeight: '600' }}
          >
            Content Themes
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.contentThemes && data.contentThemes.length > 0 ? (
              data.contentThemes.map((theme: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-4 py-2 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                    fontWeight: '500'
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
                  className="px-4 py-2 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                    fontWeight: '500'
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
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Total Followers:</span>
                <span className="ml-2">{primarySocial?.followers?.toLocaleString() || '0'}</span>
              </div>
              <div>
                <span className="font-semibold">Primary Age:</span>
                <span className="ml-2">{data.audience?.age?.[0]?.label || '25-34'}</span>
              </div>
              <div>
                <span className="font-semibold">Top Markets:</span>
                <span className="ml-2">
                  {data.audience?.geo?.slice(0, 3).map((g: any) => g.label).join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Est. CPM:</span>
                <span className="ml-2">{data.brandFit?.estimatedCPM || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Brand Partnerships & Contact */}
      <div 
        className="pdf-page bg-white shadow-sm font-sans" 
        style={{ 
          width: '210mm', 
          height: '297mm',
          padding: '16mm',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8" style={{ color: brandColor }}>
          Brand Partnerships
        </h1>

        {/* Target Brands */}
        {data.brands && data.brands.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Brands I'm Targeting</h2>
            <div className="grid grid-cols-3 gap-6">
              {data.brands.slice(0, 6).map((brand: any, idx: number) => (
                <div 
                  key={idx} 
                  className="border-2 rounded-lg p-6 text-center"
                  style={{ borderColor: `${brandColor}40` }}
                >
                  <div className="text-xl font-bold mb-2">{brand.name}</div>
                  <div className="text-sm text-gray-600">{brand.industry || brand.domain}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 p-8 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-600 text-lg mb-4">Ready to partner with brands in:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.brandFit?.idealIndustries?.slice(0, 6).map((industry: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium border"
                  style={{ borderColor: `${brandColor}40` }}
                >
                  {industry}
                </span>
              )) || (
                <span className="text-gray-500">Various industries</span>
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
                  className="border-l-4 pl-6 py-4"
                  style={{ borderColor: brandColor }}
                >
                  <div className="font-bold text-lg">{contact.name}</div>
                  <div className="text-gray-600">{contact.title}</div>
                  <div className="text-sm mt-2">
                    <span className="font-medium">{contact.brandName}</span>
                    {contact.email && (
                      <>
                        <span className="mx-2">•</span>
                        <span style={{ color: brandColor }}>{contact.email}</span>
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
          className="rounded-2xl p-8 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}25)`
          }}
        >
          <h2 className="text-2xl font-bold mb-4">Let's Collaborate</h2>
          <p className="text-lg mb-6 text-gray-700">
            Ready to bring your brand to my engaged community. Let's create something amazing together.
          </p>
          <div className="flex justify-center gap-8 text-base">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📧</span>
              <span className="font-medium">{data.contact?.email || 'contact@example.com'}</span>
            </div>
            {primarySocial && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <span className="font-medium">@{data.creator?.name || primarySocial.platform}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
