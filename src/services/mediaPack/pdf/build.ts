import { generateEnhancedMediaPackPDF, MediaPackData, ThemeData } from "./enhanced-generator";

export async function renderBufferFromPayload(payload: any, theme: any, variant: string): Promise<Buffer> {
  try {
    console.log('Generating PDF with jsPDF...');
    
    // Convert payload to MediaPackData format
    const mediaPackData: MediaPackData = {
      creator: payload?.creator,
      socials: payload?.socials,
      metrics: payload?.metrics,
      audience: payload?.audience,
      brands: payload?.brands,
      services: payload?.services,
      caseStudies: payload?.caseStudies,
      platforms: payload?.platforms,
      summary: payload?.summary
    };
    
    // Convert theme to ThemeData format
    const themeData: ThemeData = {
      brandColor: theme?.brandColor || "#3b82f6",
      dark: theme?.dark || false,
      variant: theme?.variant || variant,
      onePager: theme?.onePager || false
    };
    
    console.log('Rendering PDF with data:', { mediaPackData, themeData, variant });
    
    const pdfBuffer = generateEnhancedMediaPackPDF(mediaPackData, themeData, variant);
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}