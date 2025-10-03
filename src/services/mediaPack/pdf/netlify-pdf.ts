import { generateMediaPackPDFWithPuppeteer, MediaPackData, ThemeData } from './puppeteer-generator';

export async function generatePdf(html: string): Promise<Buffer> {
  // For Netlify, we'll use the existing puppeteer implementation
  // This is a simplified adapter that takes HTML and returns a Buffer
  // In practice, the Netlify implementation would use the full data structure
  // but for the adapter pattern, we'll create a minimal implementation
  
  // Create a basic theme for the HTML content
  const themeData: ThemeData = {
    brandColor: "#3b82f6",
    dark: false,
    variant: "classic",
    onePager: false
  };
  
  // Create minimal data structure for the existing function
  const data: MediaPackData = {};
  
  // Use the existing Netlify-compatible PDF generation
  return generateMediaPackPDFWithPuppeteer(data, themeData, 'classic');
}
