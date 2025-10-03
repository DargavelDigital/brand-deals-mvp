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
    backgroundColor: '#ffffff',
    color: theme.brandColor,
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'semibold',
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

// ReactPDF Component that matches the preview
const MediaPackPDF = ({ data, theme, variant }: { data: MediaPackData; theme: ThemeData; variant: string }) => {
  const styles = createStyles(theme);
  
  const creator = data.creator || {};
  const metrics = data.metrics || [
    { key: 'followers', label: 'Followers', value: '1.2M' },
    { key: 'engagement', label: 'Engagement', value: '4.8%' },
    { key: 'topGeo', label: 'Top Geo', value: 'US/UK' }
  ];
  const brands = data.brands || [
    { name: 'Tech Brands', reasons: ['Perfect audience alignment for tech products and services'], website: '#' },
    { name: 'Lifestyle Brands', reasons: ['High engagement with lifestyle and fashion content'], website: '#' }
  ];
  const summary = data.summary || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average engagement rate.';
  const audience = data.audience || { followers: 1200000, engagement: 0.048, topGeo: ['US', 'UK', 'CA'] };
  const cta = data.cta || { bookUrl: '#', proposalUrl: '#' };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
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

          {/* Metrics Section */}
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

          {/* Content Grid */}
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

          {/* Brands Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Fit</Text>
            <View style={styles.brandsGrid}>
              {brands.map((brand, index) => (
                <View key={index} style={styles.brandCard}>
                  <Text style={styles.brandName}>{brand.name}</Text>
                  <Text style={styles.brandReasons}>
                    {brand.reasons.join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Partner?</Text>
            <Text style={styles.ctaText}>Let's create something amazing together</Text>
            <View style={styles.ctaButtons}>
              <Text style={styles.ctaButton}>Book a Call</Text>
              <Text style={styles.ctaButton}>View Proposal</Text>
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

export async function generateMediaPackPDFWithReactPDF(data: MediaPackData, theme: ThemeData, variant: string = 'classic'): Promise<Buffer> {
  const { pdf } = await import('@react-pdf/renderer');
  
  const doc = <MediaPackPDF data={data} theme={theme} variant={variant} />;
  const pdfBuffer = await pdf(doc).toBuffer();
  
  return pdfBuffer;
}
