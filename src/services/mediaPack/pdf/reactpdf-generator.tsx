import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
});

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
}

export interface ThemeData {
  brandColor: string;
  dark?: boolean;
  variant?: string;
  onePager?: boolean;
}

// Create styles that match the preview components
const createStyles = (theme: ThemeData) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: theme.dark ? '#0f172a' : '#ffffff',
    color: theme.dark ? '#ffffff' : '#0f172a',
    fontFamily: 'Inter',
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
    backgroundColor: theme.brandColor,
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
    color: theme.dark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: theme.dark ? '#94a3b8' : '#64748b',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: theme.dark ? '#ffffff' : '#0f172a',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.dark ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme.dark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 12,
    padding: 16,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.dark ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.brandColor,
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.dark ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme.dark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: theme.dark ? '#ffffff' : '#0f172a',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: theme.dark ? '#cbd5e1' : '#475569',
    lineHeight: 1.6,
  },
  brandsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  brandCard: {
    backgroundColor: theme.dark ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme.dark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    flex: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: theme.brandColor,
    marginBottom: 8,
  },
  brandReasons: {
    fontSize: 11,
    color: theme.dark ? '#cbd5e1' : '#475569',
    lineHeight: 1.5,
  },
  ctaSection: {
    backgroundColor: theme.brandColor,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: theme.brandColor,
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'semibold',
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    color: theme.dark ? '#ffffff' : '#000000',
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'semibold',
    border: `1px solid ${theme.dark ? '#374151' : '#e5e7eb'}`,
  },
  brandFitCard: {
    backgroundColor: '#ffffff',
    border: `1px solid ${theme.dark ? '#374151' : '#e5e7eb'}`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    gridColumn: '1 / span 2',
  },
  brandReasonsList: {
    marginTop: 8,
  },
  brandReasonItem: {
    fontSize: 11,
    color: theme.dark ? '#cbd5e1' : '#475569',
    lineHeight: 1.5,
    marginBottom: 2,
  },
  brandWebsite: {
    fontSize: 10,
    color: theme.brandColor,
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: `1px solid ${theme.dark ? '#334155' : '#e2e8f0'}`,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: theme.dark ? '#94a3b8' : '#64748b',
  },
});

// ReactPDF Component that matches the preview exactly
const MediaPackPDF = ({ data, theme, variant }: { data: any; theme: any; variant: string }) => {
  const styles = createStyles(theme);
  
  console.log('MediaPackPDF received data:', data);
  console.log('MediaPackPDF received theme:', theme);
  
  // Use exact same data as MPClassic preview
  const creator = data.creator || { displayName: 'Sarah Johnson', tagline: 'Lifestyle Creator • Tech Enthusiast • Storyteller' };
  const metrics = data.metrics || [
    { key: 'followers', label: 'Followers', value: '1.2M' },
    { key: 'engagement', label: 'Engagement', value: '4.8%' },
    { key: 'topGeo', label: 'Top Geo', value: 'US/UK' }
  ];
  const brands = data.brands || [
    { name: 'Acme Co', reasons: ['Great fit', 'Similar audiences'], website: 'https://acme.com' }
  ];
  const summary = data.summary || 'Polished AI-written summary will appear here.';
  const audience = data.audience || { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] };
  const cta = data.cta || { bookUrl: '#', proposalUrl: '#' };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header - matches MPClassic structure */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                {(creator.displayName || creator.name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.creatorName}>
                {creator.displayName || creator.name || 'Creator Name'}
              </Text>
              <Text style={styles.tagline}>
                {creator.tagline || 'Creator • Partnerships • Storytelling'}
              </Text>
            </View>
          </View>

          {/* Audience & Performance Section - matches MPClassic */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience & Performance</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric) => (
                <View key={metric.key} style={styles.metricCard}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  {metric.sub && (
                    <Text style={[styles.metricLabel, { marginTop: 4 }]}>{metric.sub}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Content Grid - matches MPClassic structure */}
          <View style={styles.contentGrid}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Executive Summary</Text>
              <Text style={styles.cardText}>{summary}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Audience Snapshot</Text>
              <Text style={styles.cardText}>
                Followers: {audience.followers.toLocaleString()}{'\n'}
                Engagement: {(audience.engagement * 100).toFixed(1)}%{'\n'}
                Top Geo: {audience.topGeo.join(', ')}
              </Text>
            </View>
          </View>

          {/* Brand Fit Section - exact match to MPClassic (spans 2 columns) */}
          <View style={styles.brandFitCard}>
            <Text style={styles.cardTitle}>Brand Fit</Text>
            <View style={styles.brandsGrid}>
              {brands.map((brand, index) => (
                <View key={index} style={styles.brandCard}>
                  <Text style={styles.brandName}>{brand.name}</Text>
                  <View style={styles.brandReasonsList}>
                    {brand.reasons.map((reason, i) => (
                      <Text key={i} style={styles.brandReasonItem}>• {reason}</Text>
                    ))}
                  </View>
                  {brand.website && (
                    <Text style={styles.brandWebsite}>{brand.website}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section - exact match to MPClassic */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to explore a partnership?</Text>
            <Text style={styles.ctaText}>
              We can tailor concepts to your goals—short-form, long-form, multi-platform, or multi-month.
            </Text>
            <View style={styles.ctaButtons}>
              <Text style={styles.ctaButton}>Book a call</Text>
              <Text style={styles.ctaButtonSecondary}>Request proposal</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated on {new Date().toLocaleDateString()} • Contact for partnership opportunities
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateMediaPackPDFWithReactPDF(data: any, theme: any, variant: string = 'classic'): Promise<Buffer> {
  try {
    const { renderToBuffer } = await import('@react-pdf/renderer');
    
    const doc = <MediaPackPDF data={data} theme={theme} variant={variant} />;
    
    // Use renderToBuffer for proper PDF generation
    const pdfBuffer = await renderToBuffer(doc);
    
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Failed to generate PDF buffer');
    }
    
    return pdfBuffer;
  } catch (error) {
    console.error('ReactPDF generation error:', error);
    throw error;
  }
}
