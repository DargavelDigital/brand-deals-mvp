import jsPDF from 'jspdf';

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
    highlights?: string[];
  };
  brandContext?: {
    name: string;
    domain?: string;
  };
}

export interface ThemeData {
  brandColor: string;
  dark?: boolean;
  variant?: string;
  onePager?: boolean;
}

export function generateCompleteMediaPackPDF(data: any, theme: ThemeData, variant: string = 'classic'): Buffer {
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
  const borderColor = theme.dark ? "#374151" : "#e6e7ea";
  const surfaceColor = theme.dark ? "#1f2937" : "#f7f7f8";
  const accentColor = brandColor;
  const tintAccent = brandColor + "20";
  const successColor = "#10b981";
  const tintSuccess = "#10b98120";
  
  // Extract data from the rich structure
  const creator = data.creator || {};
  const socials = data.socials || [];
  const audience = data.audience || {};
  const brands = data.brands || [];
  const caseStudies = data.caseStudies || [];
  const services = data.services || [];
  const ai = data.ai || {};
  const brandContext = data.brandContext || {};
  const contentPillars = data.contentPillars || [];
  const contact = data.contact || {};
  
  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = options.maxWidth || contentWidth;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };
  
  // Helper function to add section header
  const addSectionHeader = (title: string, y: number) => {
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.setFont(undefined, 'bold');
    const newY = addText(title, margin, y, { maxWidth: contentWidth });
    doc.setFont(undefined, 'normal');
    return newY + sectionSpacing;
  };
  
  // Helper function to add card
  const addCard = (x: number, y: number, width: number, height: number, content: () => void) => {
    // Card background
    doc.setFillColor(cardBg);
    doc.rect(x, y, width, height, 'F');
    
    // Card border
    doc.setDrawColor(borderColor);
    doc.rect(x, y, width, height, 'S');
    
    // Save current state
    const savedY = yPosition;
    yPosition = y + 12;
    
    // Add content
    content();
    
    // Restore state
    yPosition = savedY;
  };
  
  // Helper function to add progress bar
  const addProgressBar = (label: string, percentage: number, x: number, y: number, width: number) => {
    const barHeight = 8;
    const barWidth = width - 80; // Leave space for label and percentage
    
    // Background bar
    doc.setFillColor(borderColor);
    doc.rect(x + 60, y, barWidth, barHeight, 'F');
    
    // Progress bar
    doc.setFillColor(accentColor);
    doc.rect(x + 60, y, (barWidth * percentage) / 100, barHeight, 'F');
    
    // Label
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text(label, x, y + 6);
    
    // Percentage
    doc.text(`${Math.round(percentage)}%`, x + 60 + barWidth + 8, y + 6);
  };
  
  // Helper function to add pill/tag
  const addPill = (text: string, x: number, y: number, color: string = accentColor) => {
    const padding = 4;
    const textWidth = doc.getTextWidth(text);
    const pillWidth = textWidth + (padding * 2);
    const pillHeight = 16;
    
    // Pill background
    doc.setFillColor(color + "20");
    doc.rect(x, y, pillWidth, pillHeight, 'F');
    
    // Pill border
    doc.setDrawColor(color);
    doc.rect(x, y, pillWidth, pillHeight, 'S');
    
    // Pill text
    doc.setFontSize(10);
    doc.setTextColor(color);
    doc.text(text, x + padding, y + 11);
    
    return x + pillWidth + 8;
  };
  
  // Header section
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(brandColor);
  yPosition = addText('MEDIA PACK', margin, yPosition, { maxWidth: contentWidth });
  
  // Brand context banner
  if (brandContext.name) {
    yPosition += 10;
    doc.setFillColor(tintAccent);
    doc.rect(margin, yPosition, contentWidth, 20, 'F');
    doc.setDrawColor(accentColor);
    doc.rect(margin, yPosition, contentWidth, 20, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(accentColor);
    doc.setFont(undefined, 'bold');
    doc.text(`🎯 Tailored for ${brandContext.name}`, margin + 8, yPosition + 13);
    yPosition += 25;
  }
  
  // Creator info section
  addCard(margin, yPosition, contentWidth, 80, () => {
    // Creator avatar placeholder (64x64)
    doc.setFillColor(surfaceColor);
    doc.rect(margin + 8, yPosition + 8, 32, 32, 'F');
    doc.setDrawColor(borderColor);
    doc.rect(margin + 8, yPosition + 8, 32, 32, 'S');
    
    // Creator name and tagline
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.setFont(undefined, 'bold');
    addText(creator.name || creator.displayName || 'Creator Name', margin + 50, yPosition + 8, { maxWidth: contentWidth - 60 });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(mutedColor);
    addText(creator.tagline || 'Creator • Partnerships • Storytelling', margin + 50, yPosition + 20, { maxWidth: contentWidth - 60 });
    
    // Brand logo placeholder
    doc.setFillColor(surfaceColor);
    doc.rect(margin + 50, yPosition + 35, 20, 20, 'F');
    doc.setDrawColor(borderColor);
    doc.rect(margin + 50, yPosition + 35, 20, 20, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    doc.text(`Partnering with ${brandContext.name || 'Brand'}`, margin + 75, yPosition + 47);
    
    // Elevator pitch
    if (ai.elevatorPitch) {
      doc.setFontSize(11);
      doc.setTextColor(textColor);
      addText(ai.elevatorPitch, margin + 8, yPosition + 50, { maxWidth: contentWidth - 16 });
    }
    
    // Highlights
    if (ai.highlights && ai.highlights.length > 0) {
      yPosition += 15;
      ai.highlights.slice(0, 3).forEach((highlight, index) => {
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        addText(`• ${highlight}`, margin + 8, yPosition + (index * 12), { maxWidth: contentWidth - 16 });
      });
    }
  });
  
  yPosition += 90;
  
  // Social Media Reach section
  yPosition = addSectionHeader('Social Media Reach', yPosition);
  
  if (socials.length > 0) {
    const cardWidth = (contentWidth - 16) / Math.min(socials.length, 3);
    let cardX = margin;
    
    socials.forEach((social, index) => {
      addCard(cardX, yPosition, cardWidth, 80, () => {
        // Platform icon
        doc.setFillColor(tintAccent);
        doc.rect(cardX + 8, yPosition + 8, 20, 20, 'F');
        doc.setDrawColor(accentColor);
        doc.rect(cardX + 8, yPosition + 8, 20, 20, 'S');
        
        doc.setFontSize(12);
        doc.setTextColor(accentColor);
        doc.setFont(undefined, 'bold');
        doc.text(social.platform.charAt(0).toUpperCase(), cardX + 15, yPosition + 20);
        
        // Platform name
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.setFont(undefined, 'bold');
        addText(social.platform.charAt(0).toUpperCase() + social.platform.slice(1), cardX + 35, yPosition + 8, { maxWidth: cardWidth - 40 });
        
        // Followers
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        addText(formatNumber(social.followers), cardX + 8, yPosition + 25, { maxWidth: cardWidth - 16 });
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        addText('Followers', cardX + 8, yPosition + 35, { maxWidth: cardWidth - 16 });
        
        // Additional metrics
        if (social.avgViews) {
          addText(`Avg Views: ${formatNumber(social.avgViews)}`, cardX + 8, yPosition + 45, { maxWidth: cardWidth - 16 });
        }
        
        addText(`Engagement: ${(social.engagementRate * 100).toFixed(1)}%`, cardX + 8, yPosition + 55, { maxWidth: cardWidth - 16 });
        
        if (social.growth30d) {
          doc.setTextColor(successColor);
          addText(`Growth: +${(social.growth30d * 100).toFixed(1)}%`, cardX + 8, yPosition + 65, { maxWidth: cardWidth - 16 });
        }
      });
      
      cardX += cardWidth + 8;
      if ((index + 1) % 3 === 0) {
        cardX = margin;
        yPosition += 90;
      }
    });
    
    if (socials.length % 3 !== 0) {
      yPosition += 90;
    }
  }
  
  // Audience Demographics section
  yPosition = addSectionHeader('Audience Demographics', yPosition);
  
  addCard(margin, yPosition, contentWidth, 120, () => {
    // Age Distribution
    if (audience.age && audience.age.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont(undefined, 'bold');
      addText('Age Distribution', margin + 8, yPosition + 8, { maxWidth: contentWidth / 2 - 16 });
      
      audience.age.forEach((age, index) => {
        addProgressBar(age.label, age.value * 100, margin + 8, yPosition + 20 + (index * 15), contentWidth / 2 - 16);
      });
    }
    
    // Gender Split
    if (audience.gender && audience.gender.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont(undefined, 'bold');
      addText('Gender Split', margin + contentWidth / 2 + 8, yPosition + 8, { maxWidth: contentWidth / 2 - 16 });
      
      audience.gender.forEach((gender, index) => {
        addProgressBar(gender.label, gender.value * 100, margin + contentWidth / 2 + 8, yPosition + 20 + (index * 15), contentWidth / 2 - 16);
      });
    }
    
    // Top Locations
    if (audience.geo && audience.geo.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont(undefined, 'bold');
      addText('Top Locations', margin + 8, yPosition + 80, { maxWidth: contentWidth - 16 });
      
      audience.geo.slice(0, 5).forEach((geo, index) => {
        addProgressBar(geo.label, geo.value * 100, margin + 8, yPosition + 95 + (index * 15), contentWidth - 16);
      });
    }
  });
  
  yPosition += 130;
  
  // Content Pillars section
  if (contentPillars.length > 0) {
    yPosition = addSectionHeader('Content Pillars', yPosition);
    
    let pillX = margin;
    let pillY = yPosition;
    
    contentPillars.forEach((pillar, index) => {
      pillX = addPill(pillar, pillX, pillY, accentColor);
      
      // Move to next line if we run out of space
      if (pillX > contentWidth - 50) {
        pillX = margin;
        pillY += 20;
      }
    });
    
    yPosition = pillY + 25;
  }
  
  // Case Studies section
  if (caseStudies.length > 0) {
    yPosition = addSectionHeader('Case Studies', yPosition);
    
    // Proof of Performance badge
    doc.setFillColor(tintSuccess);
    doc.rect(margin, yPosition, 120, 16, 'F');
    doc.setDrawColor(successColor);
    doc.rect(margin, yPosition, 120, 16, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(successColor);
    doc.setFont(undefined, 'bold');
    doc.text('📊 Proof of Performance', margin + 4, yPosition + 11);
    
    yPosition += 25;
    
    const caseCardWidth = (contentWidth - 16) / Math.min(caseStudies.length, 2);
    let caseX = margin;
    
    caseStudies.forEach((study, index) => {
      addCard(caseX, yPosition, caseCardWidth, 100, () => {
        // Brand logo placeholder
        doc.setFillColor(surfaceColor);
        doc.rect(caseX + 8, yPosition + 8, 20, 20, 'F');
        doc.setDrawColor(borderColor);
        doc.rect(caseX + 8, yPosition + 8, 20, 20, 'S');
        
        // Brand name
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.setFont(undefined, 'bold');
        addText(study.brand.name, caseX + 35, yPosition + 8, { maxWidth: caseCardWidth - 40 });
        
        // Goal
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(textColor);
        addText('Goal', caseX + 8, yPosition + 25, { maxWidth: caseCardWidth - 16 });
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        addText(study.goal, caseX + 8, yPosition + 35, { maxWidth: caseCardWidth - 16 });
        
        // Work
        doc.setFont(undefined, 'bold');
        doc.setTextColor(textColor);
        addText('Work', caseX + 8, yPosition + 50, { maxWidth: caseCardWidth - 16 });
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        addText(study.work, caseX + 8, yPosition + 60, { maxWidth: caseCardWidth - 16 });
        
        // Result
        doc.setFont(undefined, 'bold');
        doc.setTextColor(textColor);
        addText('Result', caseX + 8, yPosition + 75, { maxWidth: caseCardWidth - 16 });
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        addText(study.result, caseX + 8, yPosition + 85, { maxWidth: caseCardWidth - 16 });
      });
      
      caseX += caseCardWidth + 8;
      if ((index + 1) % 2 === 0) {
        caseX = margin;
        yPosition += 110;
      }
    });
    
    if (caseStudies.length % 2 !== 0) {
      yPosition += 110;
    }
  }
  
  // Services & Pricing section
  if (services.length > 0) {
    yPosition = addSectionHeader('Services & Pricing', yPosition);
    
    addCard(margin, yPosition, contentWidth, 60 + (services.length * 20), () => {
      // Table header
      doc.setFillColor(surfaceColor);
      doc.rect(margin + 8, yPosition + 8, contentWidth - 16, 20, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.setFont(undefined, 'bold');
      doc.text('Service', margin + 12, yPosition + 20);
      doc.text('Price', margin + 12 + (contentWidth - 16) * 0.4, yPosition + 20);
      doc.text('Notes', margin + 12 + (contentWidth - 16) * 0.7, yPosition + 20);
      
      // Table rows
      services.forEach((service, index) => {
        const rowY = yPosition + 30 + (index * 20);
        
        // Row background
        if (index % 2 === 0) {
          doc.setFillColor(surfaceColor);
          doc.rect(margin + 8, rowY, contentWidth - 16, 20, 'F');
        }
        
        // Service name
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(textColor);
        doc.text(service.label, margin + 12, rowY + 12);
        
        // Price
        doc.setFont(undefined, 'bold');
        doc.text(`$${service.price.toLocaleString()}`, margin + 12 + (contentWidth - 16) * 0.4, rowY + 12);
        
        // Notes
        doc.setFont(undefined, 'normal');
        doc.setTextColor(mutedColor);
        doc.text(service.notes, margin + 12 + (contentWidth - 16) * 0.7, rowY + 12);
      });
    });
    
    yPosition += 80 + (services.length * 20);
  }
  
  // CTA Section
  yPosition += 20;
  addCard(margin, yPosition, contentWidth, 80, () => {
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.setFont(undefined, 'bold');
    addText('Ready to work together?', margin + 8, yPosition + 8, { maxWidth: contentWidth - 16 });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(mutedColor);
    addText("Let's discuss how we can create amazing content together.", margin + 8, yPosition + 25, { maxWidth: contentWidth - 16 });
    
    // CTA Buttons
    doc.setFillColor(accentColor);
    doc.rect(margin + 8, yPosition + 40, 80, 25, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Book a Call', margin + 25, yPosition + 55);
    
    doc.setFillColor(cardBg);
    doc.setDrawColor(borderColor);
    doc.rect(margin + 100, yPosition + 40, 100, 25, 'FD');
    doc.setTextColor(textColor);
    doc.text('Request Proposal', margin + 115, yPosition + 55);
    
    // Contact info
    if (contact.email || contact.phone || contact.website) {
      yPosition += 20;
      doc.setFontSize(9);
      doc.setTextColor(mutedColor);
      doc.setFont(undefined, 'normal');
      
      if (contact.email) {
        addText(`Email: ${contact.email}`, margin + 8, yPosition + 8, { maxWidth: contentWidth - 16 });
      }
      if (contact.phone) {
        addText(`Phone: ${contact.phone}`, margin + 8, yPosition + 18, { maxWidth: contentWidth - 16 });
      }
      if (contact.website) {
        addText(`Website: ${contact.website}`, margin + 8, yPosition + 28, { maxWidth: contentWidth - 16 });
      }
    }
  });
  
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
