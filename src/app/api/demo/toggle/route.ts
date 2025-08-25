import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    // In a real app, you might store this in a database or session
    // For now, we'll just return success
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
    
    return NextResponse.json({ 
      success: true, 
      demoMode: enabled 
    });
  } catch (error: any) {
    console.error('Error toggling demo mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle demo mode' },
      { status: 500 }
    );
  }
}
