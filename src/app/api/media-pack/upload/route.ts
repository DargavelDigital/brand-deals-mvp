import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    
    if (!file || !filename) {
      return NextResponse.json(
        { success: false, error: 'Missing file or filename' },
        { status: 400 }
      );
    }
    
    console.log('☁️ Uploading to Vercel Blob:', filename);
    console.log('📊 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Upload to Vercel Blob (server-side has access to env vars)
    const blob = await put(filename, file, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: false,
      token: process.env.hyper_READ_WRITE_TOKEN // ✅ Available server-side
    });
    
    console.log('✅ Upload successful:', blob.url);
    
    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      fileId: filename
    });
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

