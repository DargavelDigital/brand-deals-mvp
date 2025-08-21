import { prisma } from '@/lib/prisma';
import { renderHTML, MediaPackVars, MediaPackVariant } from './renderer';
import { exportPdf } from './pdf';
import { getLatestAudit } from '../audit';
import { requireCredits } from '../credits';
import fs from 'fs';
import path from 'path';

export interface MediaPackResult {
  mediaPackId: string;
  htmlUrl: string;
  pdfUrl: string;
  summary: string;
}

export async function generateMediaPack(workspaceId: string, brandId: string, variant: MediaPackVariant): Promise<MediaPackResult> {
  // Check credits
  await requireCredits('MEDIA_PACK', 1, workspaceId);

  try {
    // Load latest audit data
    const latestAudit = await getLatestAudit(workspaceId);
    if (!latestAudit) {
      throw new Error('No audit data available. Please run an audit first.');
    }

    // Load brand and brand profile
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { profile: true }
    });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // Compute variables for template
    const vars: MediaPackVars = {
      // Audit data
      audienceSize: formatNumber(latestAudit.audience.size),
      topGeo: latestAudit.audience.topGeo,
      topAge: latestAudit.audience.topAge,
      engagementRate: `${(latestAudit.audience.engagementRate * 100).toFixed(1)}%`,
      insightOne: latestAudit.insights[0] || 'Continue building authentic content',
      insightTwo: latestAudit.insights[1] || 'Focus on community engagement',
      
      // Brand data
      brandName: brand.name,
      brandLogoUrl: brand.profile?.logoUrl || '',
      brandPrimaryColor: brand.profile?.brandPrimaryColor || '#3B82F6',
      brandSecondaryColor: brand.profile?.brandSecondaryColor || '#1E40AF',
      
      // Formatting
      formatA: 'Standard Package',
      formatB: 'Premium Package',
      
      // Metadata
      generatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      workspaceName: 'Your Workspace' // TODO: Get from workspace
    };

    // Generate HTML
    const html = renderHTML(variant, vars);
    
    // Generate PDF
    const pdfBuffer = await exportPdf(html);

    // Create storage directory if it doesn't exist
    const storageDir = path.join(process.cwd(), 'storage', 'media-packs');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const htmlFilename = `media-pack-${timestamp}.html`;
    const pdfFilename = `media-pack-${timestamp}.pdf`;
    
    const htmlPath = path.join(storageDir, htmlFilename);
    const pdfPath = path.join(storageDir, pdfFilename);

    // Save files
    fs.writeFileSync(htmlPath, html);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Create URLs (for local development, these will be file paths)
    const htmlUrl = `/storage/media-packs/${htmlFilename}`;
    const pdfUrl = `/storage/media-packs/${pdfFilename}`;

    // Create MediaPack record in database
    const mediaPack = await prisma.mediaPack.create({
      data: {
        workspaceId,
        brandId,
        variant,
        htmlUrl,
        pdfUrl,
        metadata: {
          audienceSize: latestAudit.audience.size,
          engagementRate: latestAudit.audience.engagementRate,
          topGeo: latestAudit.audience.topGeo,
          topAge: latestAudit.audience.topAge,
          insights: latestAudit.insights.slice(0, 2),
          generatedAt: new Date().toISOString()
        }
      }
    });

    return {
      mediaPackId: mediaPack.id,
      htmlUrl,
      pdfUrl,
      summary: `Generated ${variant} media pack for ${brand.name} with ${vars.audienceSize} audience data`
    };

  } catch (error) {
    console.error('Media pack generation failed:', error);
    throw error;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
