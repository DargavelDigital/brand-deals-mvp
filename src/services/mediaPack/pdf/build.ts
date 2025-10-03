import { generateMediaPackPDFWithPuppeteer, MediaPackData, ThemeData } from "./puppeteer-generator";

export async function renderBufferFromPayload(payload: any, theme: any, variant: string): Promise<Buffer> {
  try {
    console.log('Generating PDF with Puppeteer...');
    
    // Convert theme to ThemeData format
    const themeData: ThemeData = {
      brandColor: theme?.brandColor || "#3b82f6",
      dark: theme?.dark || false,
      variant: theme?.variant || variant,
      onePager: theme?.onePager || false
    };
    
    console.log('Rendering PDF with data:', { payload, themeData, variant });
    
    const pdfBuffer = await generateMediaPackPDFWithPuppeteer(payload, themeData, variant);
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}