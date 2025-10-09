// Creator stage detection and adaptive guidance

export type CreatorStage = 'beginner' | 'growing' | 'established' | 'professional'

export interface StageInfo {
  stage: CreatorStage
  label: string
  followerRange: string
  focus: string
  color: string
  icon: string
}

export function detectCreatorStage(params: {
  totalFollowers: number
  totalPosts?: number
  avgEngagement?: number
}): StageInfo {
  const { totalFollowers, totalPosts = 0 } = params
  
  if (totalFollowers < 100 || totalPosts < 10) {
    return {
      stage: 'beginner',
      label: 'Just Starting Out',
      followerRange: '0-100',
      focus: 'Building foundation and finding voice',
      color: 'green',
      icon: '🌱'
    }
  } else if (totalFollowers < 5000) {
    return {
      stage: 'growing',
      label: 'Growing Creator',
      followerRange: '100-5k',
      focus: 'Consistency and optimization',
      color: 'blue',
      icon: '📈'
    }
  } else if (totalFollowers < 50000) {
    return {
      stage: 'established',
      label: 'Established Creator',
      followerRange: '5k-50k',
      focus: 'Monetization and brand partnerships',
      color: 'purple',
      icon: '🎯'
    }
  } else {
    return {
      stage: 'professional',
      label: 'Professional Creator',
      followerRange: '50k+',
      focus: 'Scale and advanced strategies',
      color: 'gold',
      icon: '⭐'
    }
  }
}

export function getToneGuidance(stage: CreatorStage): string {
  const guidance = {
    beginner: `
Be encouraging, educational, and roadmap-focused. Use phrases like "You're at the perfect starting point!" and "Here's your path forward". 
Avoid corporate jargon. Focus on habits, consistency, and learning. 
DON'T mention brand partnerships, monetization, or complex analytics yet.
DO celebrate that they've started, provide clear roadmap, make it feel achievable.
Example opening: "You're at the exciting beginning of your creator journey! Here's how to build a strong foundation..."
    `.trim(),
    
    growing: `
Be motivational and optimization-focused. Celebrate progress, provide specific tactics to reach next milestone.
Use phrases like "You've built momentum" and "Let's optimize to reach 1k".
Start introducing monetization concepts gently.
DO: Show progress made, provide A/B testing strategies, introduce affiliate/monetization.
DON'T: Over-complicate or assume advanced knowledge.
Example: "You've built momentum - let's optimize your strategy to reach your next milestone..."
    `.trim(),
    
    established: `
Be strategic and business-focused. Discuss monetization, brand fit, rate cards, and scaling strategies.
Use professional terminology appropriately.
DO: Provide brand matching analysis, CPM recommendations, partnership strategies, content strategy refinement.
DON'T: Give basic advice they already know.
Example: "You're positioned for partnerships - here's your brand matching profile and recommended positioning..."
    `.trim(),
    
    professional: `
Be analytical and advanced. Provide competitor insights, market positioning, and sophisticated growth tactics.
Assume they understand the business and want data-driven insights.
DO: Deep analysis, competitor comparisons, market insights, advanced scaling strategies.
DON'T: State the obvious or provide beginner tips.
Example: "As an established creator, here's your competitive positioning and advanced growth levers..."
    `.trim()
  }
  
  return guidance[stage]
}

export function getStageSpecificPromptAdditions(stageInfo: StageInfo): string {
  return `
CREATOR STAGE: ${stageInfo.stage.toUpperCase()}
Stage Label: ${stageInfo.label}
Follower Range: ${stageInfo.followerRange}
Current Focus: ${stageInfo.focus}

TONE GUIDANCE FOR THIS STAGE:
${getToneGuidance(stageInfo.stage)}

CRITICAL: Adapt ALL your analysis, recommendations, and language to this stage. Make it feel personally relevant, not generic.
  `.trim()
}

