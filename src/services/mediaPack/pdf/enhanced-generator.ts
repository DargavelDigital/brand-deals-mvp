import jsPDF from 'jspdf';

export interface MediaPackData {
  creator?: {
    displayName?: string;
    bio?: string;
    title?: string;
    tagline?: string;
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

export function generateEnhancedMediaPackPDF(data: any, theme: ThemeData, variant: string = 'classic'): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  const lineHeight = 6;
  const sectionSpacing = 15;
  
  // Colors
  const brandColor = theme.brandColor || "#3b82f6";
  const textColor = theme.dark ? "#ffffff" : "#0b0b0c";
  const mutedColor = theme.dark ? "#9ca3af" : "#6b7280";
  const cardBg = theme.dark ? "#1f2937" : "#ffffff";
  const borderColor = theme.dark ? "#374151" : "#e5e7eb";
  
  // Extract data from the rich structure
  const creator = data.creator || {};
  const socials = data.socials || [];
  const audience = data.audience || {};
  const brands = data.brands || [];
  const caseStudies = data.caseStudies || [];
  const services = data.services || [];
  const ai = data.ai || {};
  const brandContext = data.brandContext || {};
  
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
    doc.setTextColor(brandColor);
    doc.setFont(undefined, 'bold');
    const newY = addText(title, margin, y, { maxWidth: contentWidth });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(textColor);
    return newY + sectionSpacing;
  };
  
  // Helper function to add card
  const addCard = (title: string, content: string, x: number, y: number, width: number, height: number) => {
    // Card background
    doc.setFillColor(cardBg);
    doc.rect(x, y, width, height, 'F');
    
    // Card border
    doc.setDrawColor(borderColor);
    doc.rect(x, y, width, height, 'S');
    
    // Card title
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.setFont(undefined, 'bold');
    addText(title, x + 8, y + 12, { maxWidth: width - 16 });
    
    // Card content
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    addText(content, x + 8, y + 20, { maxWidth: width - 16 });
    
    return y + height + 8;
  };
  
  // Helper function to add metric card
  const addMetricCard = (label: string, value: string, x: number, y: number, width: number) => {
    const cardHeight = 40;
    
    // Card background
    doc.setFillColor(cardBg);
    doc.rect(x, y, width, cardHeight, 'F');
    
    // Card border
    doc.setDrawColor(borderColor);
    doc.rect(x, y, width, cardHeight, 'S');
    
    // Label
    doc.setFontSize(8);
    doc.setTextColor(mutedColor);
    doc.setFont(undefined, 'normal');
    addText(label.toUpperCase(), x + 8, y + 10, { maxWidth: width - 16 });
    
    // Value
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.setFont(undefined, 'bold');
    addText(value, x + 8, y + 25, { maxWidth: width - 16 });
    
    return y + cardHeight + 8;
  };
  
  // Header with logo and creator info
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(brandColor);
  yPosition = addText('MEDIA PACK', margin, yPosition, { maxWidth: contentWidth });
  
  if (creator?.name || creator?.displayName) {
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    yPosition = addText(creator.name || creator.displayName, margin, yPosition + 10, { maxWidth: contentWidth });
  }
  
  if (creator?.tagline) {
    doc.setFontSize(12);
    doc.setTextColor(mutedColor);
    yPosition = addText(creator.tagline, margin, yPosition + 5, { maxWidth: contentWidth });
  }
  
  yPosition += 15;
  
  // Audience & Performance section
  yPosition = addSectionHeader('Audience & Performance', yPosition);
  
  // Metrics cards in a grid
  const metricsWidth = (contentWidth - 16) / 3;
  let metricsY = yPosition;
  
  // Calculate total followers from socials
  const totalFollowers = socials.reduce((sum, social) => sum + (social.followers || 0), 0);
  if (totalFollowers > 0) {
    addMetricCard('Followers', formatNumber(totalFollowers), margin, metricsY, metricsWidth);
  }
  
  // Calculate average engagement from socials
  const avgEngagement = socials.length > 0 ? 
    socials.reduce((sum, social) => sum + (social.engagementRate || 0), 0) / socials.length : 0;
  if (avgEngagement > 0) {
    addMetricCard('Engagement', `${(avgEngagement * 100).toFixed(1)}%`, margin + metricsWidth + 8, metricsY, metricsWidth);
  }
  
  // Top geo from audience data
  if (audience.geo && audience.geo.length > 0) {
    const topGeo = audience.geo.slice(0, 3).map(g => g.label).join(', ');
    addMetricCard('Top Geo', topGeo, margin + (metricsWidth + 8) * 2, metricsY, metricsWidth);
  }
  
  yPosition = metricsY + 50;
  
  // Main content grid (2 columns)
  const leftColumnX = margin;
  const rightColumnX = margin + contentWidth / 2 + 8;
  const columnWidth = contentWidth / 2 - 8;
  
  // Executive Summary card
  const summaryContent = ai.elevatorPitch || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average engagement rate.';
  addCard('Executive Summary', summaryContent, leftColumnX, yPosition, columnWidth, 80);
  
  // Audience Snapshot card
  let audienceContent = '';
  if (totalFollowers > 0) {
    audienceContent += `Followers: ${formatNumber(totalFollowers)}\n`;
  }
  if (avgEngagement > 0) {
    audienceContent += `Engagement: ${(avgEngagement * 100).toFixed(1)}%\n`;
  }
  if (audience.geo && audience.geo.length > 0) {
    const topGeo = audience.geo.slice(0, 3).map(g => g.label).join(', ');
    audienceContent += `Top Geo: ${topGeo}`;
  }
  addCard('Audience Snapshot', audienceContent, rightColumnX, yPosition, columnWidth, 80);
  
  yPosition += 100;
  
  // Case Studies section (full width)
  if (caseStudies && caseStudies.length > 0) {
    yPosition = addSectionHeader('Case Studies', yPosition);
    
    const caseCardWidth = (contentWidth - 16) / Math.min(caseStudies.length, 2);
    let caseX = margin;
    
    caseStudies.forEach((study, index) => {
      let caseContent = `${study.brand.name}\n\n`;
      caseContent += `Goal: ${study.goal}\n\n`;
      caseContent += `Work: ${study.work}\n\n`;
      caseContent += `Result: ${study.result}`;
      
      addCard(study.brand.name, caseContent, caseX, yPosition, caseCardWidth, 120);
      
      caseX += caseCardWidth + 8;
      if ((index + 1) % 2 === 0) {
        caseX = margin;
        yPosition += 140;
      }
    });
    
    if (caseStudies.length % 2 !== 0) {
      yPosition += 140;
    }
  }
  
  // Social Media Presence
  if (socials && socials.length > 0) {
    yPosition = addSectionHeader('Social Media Presence', yPosition);
    
    socials.forEach(social => {
      const platformText = `${social.platform.toUpperCase()}`;
      const followersText = social.followers ? `: ${formatNumber(social.followers)} followers` : '';
      const engagementText = social.engagementRate ? ` (${(social.engagementRate * 100).toFixed(1)}% engagement)` : '';
      yPosition = addText(`• ${platformText}${followersText}${engagementText}`, margin, yPosition, { maxWidth: contentWidth });
    });
    yPosition += 10;
  }
  
  // Services
  if (services && services.length > 0) {
    yPosition = addSectionHeader('Services Offered', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    services.forEach(service => {
      const priceText = service.price ? ` - $${service.price.toLocaleString()}` : '';
      const notesText = service.notes ? ` (${service.notes})` : '';
      yPosition = addText(`• ${service.label}${priceText}${notesText}`, margin, yPosition, { maxWidth: contentWidth });
    });
    yPosition += 10;
  }
  
  // Content Pillars
  if (data.contentPillars && data.contentPillars.length > 0) {
    yPosition = addSectionHeader('Content Pillars', yPosition);
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    data.contentPillars.forEach(pillar => {
      yPosition = addText(`• ${pillar}`, margin, yPosition, { maxWidth: contentWidth });
    });
    yPosition += 10;
  }
  
  // CTA Section
  yPosition += 20;
  doc.setFillColor(cardBg);
  doc.rect(margin, yPosition, contentWidth, 60, 'F');
  doc.setDrawColor(borderColor);
  doc.rect(margin, yPosition, contentWidth, 60, 'S');
  
  doc.setFontSize(16);
  doc.setTextColor(textColor);
  doc.setFont(undefined, 'bold');
  yPosition = addText('Ready to explore a partnership?', margin + 8, yPosition + 15, { maxWidth: contentWidth - 16 });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(mutedColor);
  yPosition = addText('We can tailor concepts to your goals—short-form, long-form, multi-platform, or multi-month.', margin + 8, yPosition + 5, { maxWidth: contentWidth - 16 });
  
  // CTA Buttons (simulated)
  doc.setFillColor(brandColor);
  doc.rect(margin + 8, yPosition + 15, 60, 20, 'F');
  doc.setTextColor('#ffffff');
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Book a call', margin + 20, yPosition + 27);
  
  doc.setFillColor(cardBg);
  doc.setDrawColor(borderColor);
  doc.rect(margin + 80, yPosition + 15, 80, 20, 'FD');
  doc.setTextColor(textColor);
  doc.text('Request proposal', margin + 95, yPosition + 27);
  
  // Contact info
  if (data.contact) {
    yPosition += 40;
    doc.setFontSize(9);
    doc.setTextColor(mutedColor);
    if (data.contact.email) {
      yPosition = addText(`Email: ${data.contact.email}`, margin, yPosition, { maxWidth: contentWidth });
    }
    if (data.contact.phone) {
      yPosition = addText(`Phone: ${data.contact.phone}`, margin, yPosition, { maxWidth: contentWidth });
    }
    if (data.contact.website) {
      yPosition = addText(`Website: ${data.contact.website}`, margin, yPosition, { maxWidth: contentWidth });
    }
  }
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(mutedColor);
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
