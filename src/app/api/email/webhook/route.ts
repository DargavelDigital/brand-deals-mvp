import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data
    console.log('Email webhook received:', body);
    
    // In a real app, you would process the webhook data
    // For now, we'll just acknowledge receipt
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received' 
    });
  } catch (error: any) {
    console.error('Error processing email webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
