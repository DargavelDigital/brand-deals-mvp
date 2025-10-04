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

// Simplified ReactPDF Component to avoid null props error
const MediaPackPDF = ({ data, theme, variant }: { data: MediaPackData; theme: ThemeData; variant: string }) => {
  console.log('MediaPackPDF: Starting with data:', !!data, 'theme:', !!theme);
  
  // Ensure we have valid data
  const safeData = data || {};
  const safeTheme = theme || { brandColor: '#3b82f6', dark: false, variant: 'classic', onePager: false };
  
  console.log('MediaPackPDF: Safe data keys:', Object.keys(safeData));
  console.log('MediaPackPDF: Safe theme:', safeTheme);
  
  // Create simple, safe styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: safeTheme.dark ? '#0f172a' : '#ffffff',
      color: safeTheme.dark ? '#ffffff' : '#0f172a',
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
      color: safeTheme.dark ? '#ffffff' : '#0f172a',
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14,
      color: safeTheme.dark ? '#94a3b8' : '#64748b',
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'semibold',
      color: safeTheme.dark ? '#ffffff' : '#0f172a',
      marginBottom: 16,
    },
    paragraph: {
      fontSize: 12,
      color: safeTheme.dark ? '#cbd5e1' : '#475569',
      lineHeight: 1.6,
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
      color: safeTheme.dark ? '#ffffff' : '#0f172a',
      marginBottom: 8,
    },
    brandWebsite: {
      fontSize: 10,
      color: safeTheme.dark ? '#94a3b8' : '#64748b',
      marginTop: 4,
    },
  });
  
  // Extract safe values
  const creator = safeData.creator || {};
  const brand = safeData.brand || { name: 'Brand' };
  const summary = safeData.summary || 'Your audience is primed for partnerships.';
  
  console.log('MediaPackPDF: About to render with creator:', creator, 'brand:', brand);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                {(brand.name || 'B').charAt(0).toUpperCase()}
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

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>

          {/* Brand Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Partnership</Text>
            <View style={styles.brandCard}>
              <Text style={styles.brandName}>{brand.name}</Text>
              <Text style={styles.brandWebsite}>
                {brand.domain ? `https://${brand.domain}` : 'https://example.com'}
              </Text>
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