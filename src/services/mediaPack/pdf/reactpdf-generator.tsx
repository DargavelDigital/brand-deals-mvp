import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import React from 'react';
import type { MediaPackData } from '@/features/media-pack/schema';

// Register fonts for better typography
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
});

// Defensive helpers for React-PDF
function safeText(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function SafeImage({ src, width = 64 }: { src?: string; width?: number }) {
  if (!src) return <View />;
  return <Image src={src} style={{ width, height: "auto" }} />;
}

export interface MediaPackData {
  creator?: {
    displayName?: string;
    name?: string;
    bio?: string;
    title?: string;
    tagline?: string;
    avatar?: string;
  };
  socials?: {
    platform: string;
    followers: number;
    avgViews?: number;
    engagementRate: number;
    growth30d?: number;
  }[];
  audience?: {
    age?: { label: string; value: number }[];
    gender?: { label: string; value: number }[];
    geo?: { label: string; value: number }[];
    interests?: string[];
  };
  brands?: {
    name: string;
    reasons: string[];
    website: string;
  }[];
  services?: {
    label: string;
    price: number;
    notes: string;
    sku: string;
  }[];
  caseStudies?: {
    brand: { name: string; domain?: string };
    goal: string;
    work: string;
    result: string;
    proof?: string[];
  }[];
  contentPillars?: string[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  ai?: {
    elevatorPitch?: string;
    brandFit?: string;
    contentStrategy?: string;
  };
  summary?: string;
  metrics?: { key: string; label: string; value: string; sub?: string }[];
  cta?: { bookUrl?: string; proposalUrl?: string };
  brand?: {
    name: string;
    domain: string;
    id?: string;
  };
}

export interface ThemeData {
  brandColor: string;
  dark?: boolean;
  variant?: string;
  onePager?: boolean;
}

// ReactPDF Component using canonical MediaPackData
// FORCE REBUILD - v2.0 with correct data structure
const MediaPackPDF = ({ data, theme, variant }: { data: MediaPackData; theme: ThemeData; variant: string }) => {
  console.log('MediaPackPDF: Starting with data:', !!data, 'theme:', !!theme);
  console.log('🚀 PDF GENERATOR v2.0 - NEW CODE IS RUNNING!');
  
  // The adapter guarantees valid data with defaults
  const safeTheme = theme || { brandColor: '#3b82f6', dark: false, variant: 'classic', onePager: false };
  
  console.log('MediaPackPDF: Data keys:', Object.keys(data));
  console.log('MediaPackPDF: Theme:', safeTheme);
  
  // Create comprehensive styles for full content
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: safeTheme.dark ? '#0f172a' : '#ffffff',
      color: '#000000',
      fontFamily: 'Helvetica',
      padding: 28,
      fontSize: 12,
      lineHeight: 1.5,
    },
    container: {
      maxWidth: 960,
      margin: '0 auto',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      gap: 24,
    },
    logo: {
      width: 64,
      height: 64,
      backgroundColor: safeTheme.brandColor || '#3b82f6',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    headerContent: {
      flex: 1,
    },
    creatorName: {
      fontSize: 24,
      fontWeight: 'semibold',
      color: '#000000',
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14,
      color: '#000000',
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'semibold',
      color: '#000000',
      marginBottom: 16,
    },
    paragraph: {
      fontSize: 12,
      color: '#000000',
      lineHeight: 1.6,
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    metricCard: {
      flex: 1,
      backgroundColor: safeTheme.dark ? '#1e293b' : '#ffffff',
      border: `1px solid ${safeTheme.dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: 16,
    },
    metricLabel: {
      fontSize: 10,
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
    },
    metricSub: {
      fontSize: 10,
      color: '#000000',
    },
    brandCard: {
      backgroundColor: safeTheme.dark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${safeTheme.dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    brandName: {
      fontSize: 14,
      fontWeight: 'semibold',
      color: '#000000',
      marginBottom: 8,
    },
    brandReasons: {
      marginBottom: 8,
    },
    brandReason: {
      fontSize: 11,
      color: '#000000',
      marginBottom: 2,
    },
    brandWebsite: {
      fontSize: 10,
      color: safeTheme.dark ? '#94a3b8' : '#64748b',
      marginTop: 4,
    },
    ctaButtons: {
      flexDirection: 'row',
      gap: 16,
    },
    ctaButtonPrimary: {
      backgroundColor: safeTheme.brandColor || '#3b82f6',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 'semibold',
    },
    ctaButtonSecondary: {
      backgroundColor: 'transparent',
      color: safeTheme.dark ? '#ffffff' : '#000000',
      padding: '12px 24px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 'semibold',
      border: `1px solid ${safeTheme.dark ? '#374151' : '#e5e7eb'}`,
    },
  });
  
  const creator = data.creator || {};
  const socials = (data.socials || []).filter(Boolean);
  const cta = data.cta || {};
  const ai = data.ai || {};
  const brandContext = data.brandContext || data.brand || {};

  // Handle two data structures:
  // 1. New structure: data.socials array
  // 2. Old structure: data.creator.metrics object
  let totalFollowers, avgEngagement, avgViews;

  if (socials.length > 0) {
    // Calculate from socials array (test endpoint)
    totalFollowers = socials.reduce((sum, s) => sum + (s.followers || 0), 0);
    avgEngagement = socials.reduce((sum, s) => sum + (s.engagementRate || 0), 0) / socials.length;
    avgViews = socials.reduce((sum, s) => sum + (s.avgViews || 0), 0) / socials.length;
  } else if (creator.metrics) {
    // Use creator.metrics directly (real data from API)
    totalFollowers = creator.metrics.followers || 0;
    avgEngagement = creator.metrics.engagementRate || 0;
    avgViews = creator.metrics.avgViews || 0;
  } else {
    // Fallback
    totalFollowers = 0;
    avgEngagement = 0;
    avgViews = 0;
  }

  const metrics = [
    { key: 'followers', label: 'Total Followers', value: totalFollowers.toLocaleString(), sub: socials.length > 0 ? `Across ${socials.length} platforms` : 'Total reach' },
    { key: 'engagement', label: 'Avg Engagement', value: `${(avgEngagement * 100).toFixed(1)}%`, sub: 'Above industry average' },
    { key: 'views', label: 'Avg Views', value: Math.round(avgViews).toLocaleString(), sub: 'Per post' }
  ];

  const brands = [{
    name: brandContext.name || 'Your Brand',
    reasons: (data.proposalIdeas || ai.highlights || []).slice(0, 3).filter(Boolean),
    website: brandContext.domain ? `https://${brandContext.domain}` : ''
  }];

  const summary = ai?.elevatorPitch || data.summary || 'Your audience is primed for partnerships.';
  
  console.log('MediaPackPDF: About to render with creator:', creator, 'brandContext:', brandContext);
  console.log('MediaPackPDF: Metrics:', metrics);
  console.log('MediaPackPDF: Brands:', brands);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                {safeText((brandContext.name || 'B').charAt(0).toUpperCase())}
              </Text>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.creatorName}>
                {safeText(creator.displayName || creator.name || 'Creator Name')}
              </Text>
              <Text style={styles.tagline}>
                {safeText(creator.tagline || 'Creator • Partnerships • Storytelling')}
              </Text>
            </View>
          </View>

          {/* Audience & Performance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{safeText('Audience & Performance')}</Text>
            <View style={styles.metricsGrid}>
              {metrics.filter(Boolean).map((metric) => (
                <View key={metric.key} style={styles.metricCard}>
                  <Text style={styles.metricLabel}>{safeText(metric.label)}</Text>
                  <Text style={styles.metricValue}>{safeText(metric.value)}</Text>
                  {metric.sub ? (
                    <Text style={styles.metricSub}>{safeText(metric.sub)}</Text>
                  ) : (
                    <View />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{safeText('Summary')}</Text>
            <Text style={styles.paragraph}>{safeText(summary)}</Text>
          </View>

          {/* Brand Partnerships Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{safeText('Ideal Brand Partnerships')}</Text>
            {brands.filter(Boolean).map((b, index) => (
              <View key={index} style={styles.brandCard}>
                <Text style={styles.brandName}>{safeText(b.name)}</Text>
                <View style={styles.brandReasons}>
                  {b.reasons.filter(Boolean).map((reason, rIndex) => (
                    <Text key={rIndex} style={styles.brandReason}>• {safeText(reason)}</Text>
                  ))}
                </View>
                <Text style={styles.brandWebsite}>{safeText(b.website)}</Text>
              </View>
            ))}
          </View>

          {/* Call to Action Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{safeText('Ready to Partner?')}</Text>
            <View style={styles.ctaButtons}>
              {cta.meetingUrl ? (
                <Text style={styles.ctaButtonPrimary}>{safeText('Book a meeting')}</Text>
              ) : (
                <View />
              )}
              {cta.proposalUrl ? (
                <Text style={styles.ctaButtonSecondary}>{safeText('Request proposal')}</Text>
              ) : (
                <View />
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateMediaPackPDFWithReactPDF(data: MediaPackData, theme: ThemeData, variant: string = 'classic'): Promise<Buffer> {
  console.log('generateMediaPackPDFWithReactPDF called with:');
  console.log('data:', data ? 'present' : 'null/undefined');
  console.log('theme:', theme ? 'present' : 'null/undefined');
  console.log('variant:', variant);

  if (!data) {
    throw new Error('Data is required for PDF generation');
  }

  if (!theme) {
    throw new Error('Theme is required for PDF generation');
  }

  try {
    console.log('Importing ReactPDF...');
    const { renderToBuffer } = await import('@react-pdf/renderer');
    console.log('ReactPDF imported successfully');
    
    console.log('Creating ReactPDF document...');
    const doc = <MediaPackPDF data={data} theme={theme} variant={variant} />;
    console.log('ReactPDF document created');
    
    console.log('Rendering to buffer...');
    // Use renderToBuffer for proper PDF generation
    const pdfBuffer = await renderToBuffer(doc);
    console.log('PDF buffer generated, size:', pdfBuffer.length);
    
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Failed to generate PDF buffer');
    }
    
    return pdfBuffer;
  } catch (error) {
    console.error('ReactPDF generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw new Error(`ReactPDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}