import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
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

    const { currentBody, tone } = await req.json();

    if (!currentBody) {
      return NextResponse.json({ error: 'No email body provided' }, { status: 400 });
    }

    const toneInstructions = {
      professional: 'Make it more professional, polished, and business-appropriate.',
      relaxed: 'Make it more friendly and conversational while staying professional.',
      fun: 'Make it more engaging and personable with light humor.',
      casual: 'Make it casual and approachable.'
    };

    const prompt = `You are an expert email copywriter. Improve the following outreach email.

Current email:
${currentBody}

Instructions:
- ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}
- Keep ALL {{variables}} exactly as they are - don't remove or change them
- Maintain the core message and structure
- Improve clarity, flow, and persuasiveness
- Fix any grammar or spelling issues
- Keep it concise and scannable
- Make it more compelling

Return ONLY the improved email body, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert email copywriter. Improve emails while preserving variables and intent.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const improvedBody = completion.choices[0]?.message?.content?.trim();

    if (!improvedBody) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ 
      body: improvedBody,
      success: true 
    });

  } catch (error: any) {
    console.error('Improve email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to improve email' },
      { status: 500 }
    );
  }
}

