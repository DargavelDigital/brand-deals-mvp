import { renderToBuffer } from "@react-pdf/renderer";
import { MediaPackPDF } from "./Document-simple";
import React from "react";

export async function renderBufferFromPayload(payload: any, theme: any, variant: string) {
  try {
    // Use hardcoded data to test if the issue is with payload processing
    const safePayload = {
      creator: {
        displayName: payload?.creator?.displayName || "Test Creator",
        bio: payload?.creator?.bio || "Test bio"
      }
    };
    
    const safeTheme = {
      brandColor: theme?.brandColor || "#3b82f6",
      dark: theme?.dark || false,
      variant: variant || "classic"
    };
    
    console.log('Rendering PDF with safe data:', { safePayload, safeTheme, variant });
    
    const doc = React.createElement(MediaPackPDF, { 
      payload: safePayload, 
      theme: safeTheme, 
      variant: variant as any 
    });
    
    console.log('Document created, rendering to buffer...');
    const buf = await renderToBuffer(doc);
    console.log('Buffer created, length:', buf.length);
    
    return Buffer.from(buf);
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}
