import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { brandName } = await req.json();
    
    if (!brandName) {
      return NextResponse.json({ domain: null, error: 'Brand name required' }, { status: 400 });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `What is the primary corporate domain for "${brandName}"? Reply with ONLY the domain (e.g., "nike.com"), nothing else. If uncertain, reply "unknown".`
        }],
        max_tokens: 50,
        temperature: 0
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ domain: null, error: 'AI resolution failed' }, { status: 500 });
    }
    
    const data = await response.json();
    const domain = data.choices[0].message.content.trim().toLowerCase();
    
    // Validate domain format
    if (domain === 'unknown' || !domain.includes('.') || domain.length < 4) {
      console.log(`AI could not resolve domain for: ${brandName}`);
      return NextResponse.json({ domain: null });
    }
    
    // Remove common prefixes
    const cleanDomain = domain.replace(/^(www\.|https?:\/\/)/, '');
    
    console.log(`Resolved domain: ${brandName} -> ${cleanDomain}`);
    return NextResponse.json({ domain: cleanDomain });
    
  } catch (error) {
    console.error('Domain resolution error:', error);
    return NextResponse.json({ domain: null, error: error.message }, { status: 500 });
  }
}
