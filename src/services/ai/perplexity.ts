import OpenAI from 'openai';

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

export async function researchRealBrands(auditData: {
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

  const prompt = `You are a brand partnership expert. Research and find 10 REAL companies that would be excellent brand partnerships for this creator.

CREATOR PROFILE:
- Followers: ${auditData.followers.toLocaleString()}
- Primary Niche: ${auditData.primaryNiche}
- Content Themes: ${auditData.contentThemes.join(', ')}
- Engagement Rate: ${auditData.engagement}%
${auditData.audienceAge ? `- Audience Age: ${auditData.audienceAge}` : ''}
${auditData.audienceGender ? `- Audience Gender: ${auditData.audienceGender}` : ''}
${auditData.topMarkets ? `- Top Markets: ${auditData.topMarkets.join(', ')}` : ''}

REQUIREMENTS:
1. All brands MUST be real, existing companies (verify they exist)
2. Should actively work with influencers/creators
3. Must align with creator's niche and audience demographics
4. Include brands of varying sizes (mix of large and emerging)
5. Prioritize brands known for influencer marketing

For each brand, provide:
- Company name (official name)
- Industry category
- Website URL (if found)
- Why they're a good fit (2-3 sentences)
- Estimated company size (Startup/Small/Medium/Large/Enterprise)
- Known for influencer marketing? (Yes/No)

Return ONLY valid JSON in this exact format:
{
  "brands": [
    {
      "name": "string",
      "industry": "string",
      "website": "string or null",
      "fitReason": "string",
      "companySize": "Startup|Small|Medium|Large|Enterprise",
      "knownForInfluencerMarketing": boolean,
      "confidence": "high|medium|low"
    }
  ]
}`;

  try {
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-large-128k-online',
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

    const content = response.choices[0]?.message?.content || '{}';
    
    console.log('🔍 PERPLEXITY: Raw response received');
    
    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('🔍 PERPLEXITY: JSON parse error', parseError);
      throw new Error('Failed to parse brand research results');
    }

    console.log('🔍 PERPLEXITY: Found brands:', parsedResponse.brands?.length || 0);

    return parsedResponse.brands || [];
  } catch (error) {
    console.error('🔍 PERPLEXITY: Research failed', error);
    throw error;
  }
}

