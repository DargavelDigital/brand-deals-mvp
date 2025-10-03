import jsPDF from 'jspdf';

export interface MediaPackData {
  creator?: {
    displayName?: string;
    bio?: string;
    title?: string;
    avatar?: string;
  };
  socials?: {
    platform: string;
    handle: string;
    url: string;
    followers: number;
  }[];
  metrics?: {
    followers?: number;
    engagement?: number;
    views?: number;
    topGeo?: string[];
  };
  audience?: {
    demographics?: { age: string; gender: string }[];
    interests?: string[];
  };
  brands?: {
    name: string;
    reasons: string[];
    website: string;
  }[];
  services?: string[];
  caseStudies?: {
    title: string;
    description: string;
    image: string;
  }[];
  platforms?: string[];
  summary?: string;
}

export interface ThemeData {
  brandColor: string;
  dark?: boolean;
  variant?: string;
  onePager?: boolean;
}

export function generateMediaPackPDF(data: MediaPackData, theme: ThemeData, variant: string = 'classic'): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  const lineHeight = 6;
  const sectionSpacing = 15;
  
  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = options.maxWidth || contentWidth;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };
  
  // Helper function to add section header
  const addSectionHeader = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(theme.brandColor);
    doc.setFont(undefined, 'bold');
    const newY = addText(title, margin, y, { maxWidth: contentWidth });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    return newY + sectionSpacing;
  };
  
  // Helper function to add subsection
  const addSubsection = (title: string, content: string, y: number) => {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    let newY = addText(title, margin, y, { maxWidth: contentWidth });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    newY = addText(content, margin, newY + 2, { maxWidth: contentWidth });
    return newY + 8;
  };
  
  // Header
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(theme.brandColor);
  yPosition = addText('MEDIA PACK', margin, yPosition, { maxWidth: contentWidth });
  
  if (data.creator?.displayName) {
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    yPosition = addText(data.creator.displayName, margin, yPosition + 10, { maxWidth: contentWidth });
  }
  
  if (data.creator?.title) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    yPosition = addText(data.creator.title, margin, yPosition + 5, { maxWidth: contentWidth });
  }
  
  yPosition += 15;
  
  // Creator Bio
  if (data.creator?.bio) {
    yPosition = addSectionHeader('ABOUT', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPosition = addText(data.creator.bio, margin, yPosition, { maxWidth: contentWidth });
    yPosition += 10;
  }
  
  // Social Media Stats
  if (data.socials && data.socials.length > 0) {
    yPosition = addSectionHeader('SOCIAL MEDIA PRESENCE', yPosition);
    
    data.socials.forEach(social => {
      const platformText = `${social.platform.toUpperCase()}: @${social.handle}`;
      const followersText = social.followers ? ` (${formatNumber(social.followers)} followers)` : '';
      yPosition = addSubsection(platformText, followersText, yPosition);
    });
    yPosition += 5;
  }
  
  // Metrics
  if (data.metrics) {
    yPosition = addSectionHeader('KEY METRICS', yPosition);
    
    if (data.metrics.followers) {
      yPosition = addSubsection('Total Followers', formatNumber(data.metrics.followers), yPosition);
    }
    if (data.metrics.engagement) {
      yPosition = addSubsection('Engagement Rate', `${data.metrics.engagement}%`, yPosition);
    }
    if (data.metrics.views) {
      yPosition = addSubsection('Monthly Views', formatNumber(data.metrics.views), yPosition);
    }
    if (data.metrics.topGeo && data.metrics.topGeo.length > 0) {
      yPosition = addSubsection('Top Locations', data.metrics.topGeo.join(', '), yPosition);
    }
  }
  
  // Audience Demographics
  if (data.audience?.demographics && data.audience.demographics.length > 0) {
    yPosition = addSectionHeader('AUDIENCE DEMOGRAPHICS', yPosition);
    
    data.audience.demographics.forEach(demo => {
      yPosition = addSubsection(`${demo.age} - ${demo.gender}`, '', yPosition);
    });
  }
  
  // Interests
  if (data.audience?.interests && data.audience.interests.length > 0) {
    yPosition = addSectionHeader('AUDIENCE INTERESTS', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPosition = addText(data.audience.interests.join(', '), margin, yPosition, { maxWidth: contentWidth });
    yPosition += 10;
  }
  
  // Services
  if (data.services && data.services.length > 0) {
    yPosition = addSectionHeader('SERVICES OFFERED', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.services.forEach(service => {
      yPosition = addText(`• ${service}`, margin, yPosition, { maxWidth: contentWidth });
    });
    yPosition += 10;
  }
  
  // Platforms
  if (data.platforms && data.platforms.length > 0) {
    yPosition = addSectionHeader('PLATFORMS', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPosition = addText(data.platforms.join(', '), margin, yPosition, { maxWidth: contentWidth });
    yPosition += 10;
  }
  
  // Case Studies
  if (data.caseStudies && data.caseStudies.length > 0) {
    yPosition = addSectionHeader('CASE STUDIES', yPosition);
    
    data.caseStudies.forEach(study => {
      yPosition = addSubsection(study.title, study.description, yPosition);
    });
  }
  
  // Brand Partnerships
  if (data.brands && data.brands.length > 0) {
    yPosition = addSectionHeader('BRAND PARTNERSHIPS', yPosition);
    
    data.brands.forEach(brand => {
      let brandText = brand.name;
      if (brand.website) {
        brandText += ` (${brand.website})`;
      }
      const reasonsText = brand.reasons.length > 0 ? brand.reasons.join(', ') : '';
      yPosition = addSubsection(brandText, reasonsText, yPosition);
    });
  }
  
  // Summary
  if (data.summary) {
    yPosition = addSectionHeader('SUMMARY', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPosition = addText(data.summary, margin, yPosition, { maxWidth: contentWidth });
  }
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated by Brand Deals MVP', margin, footerY);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);
  
  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
