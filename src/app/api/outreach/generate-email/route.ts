import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepNumber, tone, brandContext, contactContext } = await req.json();

    // Build context-aware prompt
    const toneInstructions = {
      professional: 'Write in a professional, polished business tone.',
      relaxed: 'Write in a friendly, conversational yet professional tone.',
      fun: 'Write in an engaging, personable tone with light humor.',
      casual: 'Write in a casual, approachable tone.'
    };

    const prompt = `You are an expert at writing creator outreach emails for brand partnerships.

Context:
- This is email step ${stepNumber} in a sequence
- Brand: ${brandContext?.name || 'potential partner'}
- Contact: ${contactContext?.name || contactContext?.firstName || 'contact'}
- Tone: ${tone || 'professional'}

Instructions:
${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}

Write an email that:
- Is compelling and authentic
- Clearly communicates the value proposition
- Uses these variables where appropriate:
  {{contactFirstName}} - contact's first name
  {{brandName}} - brand name
  {{creatorName}} - your name
  {{followerCount}} - your follower count
  {{engagementRate}} - your engagement rate
  {{mediaPackUrl}} - link to media pack
  {{niche}} - your content niche

DO NOT include a subject line.
Return ONLY the email body text with variables in {{brackets}}.
Keep it concise (150-250 words).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert email copywriter for creator-brand partnerships. Write compelling, authentic outreach emails.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const emailBody = completion.choices[0]?.message?.content?.trim();

    if (!emailBody) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ 
      body: emailBody,
      success: true 
    });

  } catch (error: any) {
    console.error('Generate email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}

