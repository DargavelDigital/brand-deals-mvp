import OpenAI from 'openai';
import { trackAIUsage } from './track-usage';

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

export async function researchRealBrands(auditData: {
  workspaceId?: string;
  followers: number;
  contentThemes: string[];
  primaryNiche: string;
  engagement: number;
  audienceAge?: string;
  audienceGender?: string;
  topMarkets?: string[];
}) {
  console.log('🔍 PERPLEXITY: Starting brand research...', {
    followers: auditData.followers,
    niche: auditData.primaryNiche,
    themes: auditData.contentThemes
  });

  const prompt = `You are a brand partnership expert. Research and find 25 DIVERSE, REAL brand partnership opportunities for this creator.

CREATOR PROFILE:
- Followers: ${auditData.followers.toLocaleString()}
- Primary Niche: ${auditData.primaryNiche}
- Content Themes: ${auditData.contentThemes.join(', ')}
- Engagement Rate: ${auditData.engagement}%
${auditData.audienceAge ? `- Audience Age: ${auditData.audienceAge}` : ''}
${auditData.audienceGender ? `- Audience Gender: ${auditData.audienceGender}` : ''}
${auditData.topMarkets ? `- Top Markets: ${auditData.topMarkets.join(', ')}` : ''}

REQUIREMENTS - MIX OF BRAND SIZES:
1. 5 ENTERPRISE brands (e.g., Adobe, Canva, Shopify, HubSpot) - large corporations with big budgets
2. 10 MID-MARKET brands (e.g., Later, Buffer, Tailwind, ConvertKit) - growing companies actively partnering with creators
3. 5 EMERGING brands (e.g., new SaaS tools, funded startups) - smaller but strategic partnerships
4. 5 WILDCARD brands - unexpected but strategic fits the creator might not have considered

CATEGORY VARIETY:
- Direct tools (social media management, content creation)
- Adjacent tools (design, video editing, analytics, scheduling)
- Lifestyle brands (if audience fit exists)
- B2B services (if professional audience)
- Creator economy platforms
- E-commerce/DTC brands (if applicable)

STRATEGIC DIVERSITY:
- Don't just suggest obvious competitors
- Include mix of one-time and recurring partnership potential
- Consider both paid sponsorships AND affiliate opportunities
- Mix of brands with proven influencer programs and emerging opportunities

For EACH brand, provide ALL of these details:
- Company name (official, accurate name)
- Industry category (specific, e.g., "Social Media Management" not just "Tech")
- Website URL (verify it exists)
- Why THIS creator specifically (2-3 sentences, personalized to their profile)
- Company size (Enterprise/Large/Medium/Small/Startup)
- Estimated deal value range (e.g., "$500-$2,000", "$5,000-$15,000")
- Best approach strategy (e.g., "Cold email to partnerships@", "Apply via creator program", "DM on LinkedIn")
- Recent creator activity (Are they currently running creator campaigns? Any recent partnerships?)
- Known for influencer marketing? (true/false)
- Confidence level (high/medium/low)

Return ONLY valid JSON in this exact format:
{
  "brands": [
    {
      "name": "string",
      "industry": "string",
      "website": "string",
      "fitReason": "string (why THIS creator specifically)",
      "companySize": "Enterprise|Large|Medium|Small|Startup",
      "dealValueRange": "string (e.g., $1,000-$5,000)",
      "bestApproach": "string (specific outreach strategy)",
      "recentActivity": "string (current creator campaigns or recent partnerships)",
      "knownForInfluencerMarketing": boolean,
      "confidence": "high|medium|low"
    }
  ]
}

Return 25 brands ranked by strategic fit, not just industry overlap. Prioritize brands that are actively working with creators NOW.`;

  const startTime = Date.now();
  
  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar', // Updated to current Perplexity model name
      messages: [
        {
          role: 'system',
          content: 'You are a brand partnership expert who researches real companies. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const duration = Date.now() - startTime;
    let content = response.choices[0]?.message?.content || '{}';
    
    console.log('🔍 PERPLEXITY: Raw response received');
    console.log('📝 Response length:', content.length);
    console.log('📝 First 200 chars:', content.substring(0, 200));
    
    // Track AI usage if workspaceId provided
    if (auditData.workspaceId && response.usage) {
      await trackAIUsage({
        workspaceId: auditData.workspaceId,
        feature: 'brand_research',
        model: 'sonar', // Updated model name
        provider: 'perplexity',
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        },
        requestId: response.id,
        duration,
        success: true,
      });
    }
    
    // Clean and extract JSON - strip markdown if present
    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Try to extract JSON if wrapped in text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    console.log('📝 Cleaned response length:', content.length);
    console.log('📝 First 200 chars of cleaned:', content.substring(0, 200));
    console.log('📝 Last 200 chars of cleaned:', content.substring(Math.max(0, content.length - 200)));
    
    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ PERPLEXITY: JSON parse error', parseError);
      console.error('❌ Full response that failed to parse:', content);
      throw new Error('Failed to parse brand research results');
    }

    console.log('🔍 PERPLEXITY: Found brands:', parsedResponse.brands?.length || 0);

    return parsedResponse.brands || [];
  } catch (error) {
    console.error('🔍 PERPLEXITY: Research failed', error);
    
    // Track failed usage if workspaceId provided
    if (auditData.workspaceId) {
      await trackAIUsage({
        workspaceId: auditData.workspaceId,
        feature: 'brand_research',
        model: 'sonar', // Updated model name
        provider: 'perplexity',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
        duration: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    throw error;
  }
}

