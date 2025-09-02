import { aiInvoke } from './invoke';
import { MediaPackData } from '@/lib/mediaPack/types';

/**
 * Generate AI-powered copy for a media pack
 */
export async function generateMediaPackCopy(
  data: MediaPackData,
  options?: { workspaceId?: string; traceId?: string }
): Promise<Partial<MediaPackData['ai']>> {
  try {
    // Summarize social metrics
    const totalFollowers = data.socials.reduce((sum, social) => sum + social.followers, 0);
    const topPlatform = data.socials.reduce((top, social) => 
      social.followers > top.followers ? social : top
    );
    const avgEngagement = data.socials.reduce((sum, social) => 
      sum + (social.engagementRate || 0), 0
    ) / data.socials.length;

    const socialsSummary = `${totalFollowers.toLocaleString()}+ followers across ${data.socials.length} platforms (${topPlatform.platform}: ${topPlatform.followers.toLocaleString()}) with ${(avgEngagement * 100).toFixed(1)}% average engagement rate`;

    // Summarize audience data
    const topAgeGroup = data.audience.age?.reduce((top, group) => 
      group.value > top.value ? group : top
    );
    const topGender = data.audience.gender?.reduce((top, group) => 
      group.value > top.value ? group : top
    );
    const topGeo = data.audience.geo?.reduce((top, group) => 
      group.value > top.value ? group : top
    );

    const audienceSummary = `Primarily ${topAgeGroup?.label || '25-34'} ${topGender?.label || 'audience'} (${Math.round((topGender?.value || 0.5) * 100)}%) in ${topGeo?.label || 'US'} with interests in ${data.audience.interests?.slice(0, 3).join(', ') || 'lifestyle content'}`;

    // Prepare input for AI
    const aiInput = {
      creatorName: data.creator.name,
      niche: data.creator.niche || [],
      socialsSummary,
      audienceSummary,
      brandName: data.brandContext?.name || null
    };

    // Call AI with retry logic for JSON parsing
    let aiResponse;
    try {
      aiResponse = await aiInvoke(
        'outreach.mediaPackCopy.v1',
        aiInput,
        {
          tone: 'professional',
          brevity: 'short',
          workspaceId: options?.workspaceId,
          traceId: options?.traceId
        }
      );
    } catch (error) {
      console.warn('AI call failed, retrying with fallback:', error);
      // Retry once with more conservative settings
      aiResponse = await aiInvoke(
        'outreach.mediaPackCopy.v1',
        aiInput,
        {
          tone: 'professional',
          brevity: 'short',
          workspaceId: options?.workspaceId,
          traceId: options?.traceId
        }
      );
    }

    // Merge AI response into data.ai
    const result: Partial<MediaPackData['ai']> = {
      elevatorPitch: aiResponse.elevatorPitch,
      highlights: aiResponse.highlights
    };

    // Only include whyThisBrand if brandContext exists and AI provided it
    if (data.brandContext?.name && aiResponse.whyThisBrand) {
      result.whyThisBrand = aiResponse.whyThisBrand;
    }

    return result;

  } catch (error) {
    console.error('Failed to generate media pack copy:', error);
    
    // Return fallback copy if AI fails
    return {
      elevatorPitch: `${data.creator.name} is a ${data.creator.niche?.join(' and ') || 'content'} creator with ${data.socials.reduce((sum, s) => sum + s.followers, 0).toLocaleString()}+ engaged followers.`,
      highlights: [
        `${data.socials.reduce((sum, s) => sum + s.followers, 0).toLocaleString()}+ total followers`,
        `Active on ${data.socials.length} major platforms`,
        `Engaged ${data.audience.geo?.[0]?.label || 'global'} audience`,
        `Specializes in ${data.creator.niche?.join(', ') || 'content creation'}`,
        `Proven track record with brand partnerships`
      ]
    };
  }
}
