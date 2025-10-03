import { PrismaClient } from '@prisma/client';
import { renderBufferFromPayload } from './src/services/mediaPack/pdf/build.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testPdf() {
  try {
    console.log('Testing PDF generation...');
    
    const testPayload = {
      creator: {
        displayName: "Test Creator",
        bio: "Test bio"
      }
    };
    
    const testTheme = {
      brandColor: "#3b82f6",
      dark: false,
      variant: "classic"
    };
    
    console.log('Rendering PDF...');
    const pdf = await renderBufferFromPayload(testPayload, testTheme, "classic");
    
    console.log('✅ PDF generated successfully!');
    console.log('PDF size:', pdf.length, 'bytes');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testPdf();
