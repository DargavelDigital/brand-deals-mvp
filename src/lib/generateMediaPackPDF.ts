import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFGenerationResult {
  success: boolean;
  fileUrl?: string;
  fileId?: string;
  fileName?: string;
  error?: string;
}

export async function generateAndUploadMediaPackPDF(
  elementId: string,
  brandName: string,
  brandId: string,
  workspaceId: string
): Promise<PDFGenerationResult> {
  try {
    console.log('📄 Starting PDF generation for:', brandName);
    
    // Get the preview element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Media pack preview element not found');
    }

    // A4 dimensions in mm
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Find all pages with class 'pdf-page'
    const pages = element.querySelectorAll('.pdf-page');
    
    if (pages.length === 0) {
      throw new Error('No PDF pages found. Make sure template uses class="pdf-page"');
    }
    
    console.log(`📸 Found ${pages.length} pages to convert`);
    
    // Convert each page to image and add to PDF
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      
      console.log(`🎨 Rendering page ${i + 1}/${pages.length}...`);
      
      // Capture page as high-quality canvas
      const canvas = await html2canvas(page, {
        scale: 2, // 2x resolution for crisp output
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: page.offsetWidth,
        height: page.offsetHeight,
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight
      });
      
      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Add new page if not first page
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add image to PDF (full page)
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      
      console.log(`✅ Page ${i + 1} added to PDF`);
    }
    
    console.log('📦 PDF generation complete, preparing upload...');
    
    // Convert PDF to blob for upload
    const pdfBlob = pdf.output('blob');
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedBrandName = brandName.replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `${sanitizedBrandName}-MediaPack-${timestamp}.pdf`;
    const filePath = `media-packs/${workspaceId}/${fileName}`;
    
    console.log(`☁️ Uploading via API route: ${filePath}`);
    console.log(`📊 File size: ${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create FormData to send to API
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('filename', filePath);
    
    // Upload via API route (server-side has access to token)
    const uploadResponse = await fetch('/api/media-pack/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const uploadData = await uploadResponse.json();
    
    if (!uploadData.success) {
      throw new Error(uploadData.error || 'Upload failed');
    }
    
    console.log('✅ Upload complete via API!');
    console.log('🔗 URL:', uploadData.fileUrl);
    
    return {
      success: true,
      fileUrl: uploadData.fileUrl,
      fileId: uploadData.fileId,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to download PDF directly (without cloud storage)
export async function downloadMediaPackPDF(
  elementId: string,
  brandName: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pages = element.querySelectorAll('.pdf-page');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }
    
    // Download directly
    const sanitizedName = brandName.replace(/[^a-zA-Z0-9]/g, '-');
    pdf.save(`${sanitizedName}-MediaPack-${Date.now()}.pdf`);
    
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

