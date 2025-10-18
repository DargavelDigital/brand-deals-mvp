'use client'
import * as React from 'react'
import { 
  Users, Heart, BarChart2, Share2, TrendingUp, Target, 
  Lightbulb, Zap, Award, DollarSign, CheckCircle2, Clock,
  Sparkles, Building2, Package, Tag, MapPin, Calendar
} from 'lucide-react'
import AuditKPI from './AuditKPI'
import { getScoreColors, getCategoryColors, getProgressGradient } from '@/lib/audit-colors'

export type EnhancedAuditData = {
  auditId: string
  sources: string[]
  audience: {
    totalFollowers: number
    avgEngagement: number
    reachRate: number
    avgLikes: number
    avgComments: number
    avgShares: number
  }
  insights: string[]
  
  // Enhanced v2/v3 fields
  stageInfo?: {
    stage: string
    label: string
    followerRange: string
    focus: string
    color: string
    icon: string
  }
  stageMessage?: string
  
  creatorProfile?: {
    stage: string
    niche: string
    audienceSize: number
    engagementRate: string
    contentPillars: string[]
    uniqueStrengths: string[]
    growthTrajectory: string
  }
  strengthAreas?: string[]
  growthOpportunities?: string[]
  
  nextMilestones?: Array<{
    milestone: string
    difficulty: string
    impact: string
  }>
  
  brandFit?: {
    idealIndustries: string[]
    productCategories: string[]
    brandTypes: string[]
    audienceDemographics: {
      primaryAgeRange: string
      genderSkew: string
      topGeoMarkets: string[]
    }
    audienceInterests: string[]
    partnershipStyle: string
    estimatedCPM: string
    partnershipReadiness: string
  }
  immediateActions?: Array<{
    action: string
    impact: string
    timeframe: string
    difficulty?: string
  }>
  strategicMoves?: Array<{
    title: string
    why: string
    expectedOutcome: string
  }>
  
  // New simplified schema fields
  brandFitAnalysis?: {
    idealBrandTypes: string[]
    whyBrandsWantYou: string[]
    estimatedValue: string
  }
  contentAnalysis?: {
    topPerformingTypes: string[]
    contentGaps: string[]
    toneAndStyle: string
  }
  actionableStrategy?: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

export default function EnhancedAuditResults({ 
  data, 
  onRefresh 
}: {
  data: EnhancedAuditData
  onRefresh: () => void
}) {
  // Calculate overall score
  const overallScore = React.useMemo(() => {
    const engagement = data.audience.avgEngagement * 100
    const reach = data.audience.reachRate * 100
    const score = (engagement * 0.6) + (reach * 0.4)
    return Math.min(100, Math.round(score * 20))
  }, [data.audience])

  const getScoreGrade = (score: number) => {
    const colors = getScoreColors(score)
    let grade = 'D'
    if (score >= 90) grade = 'A+'
    else if (score >= 80) grade = 'A'
    else if (score >= 70) grade = 'B'
    else if (score >= 60) grade = 'C'
    
    return { 
      grade, 
      color: colors.text, 
      bg: colors.bg, 
      border: colors.border 
    }
  }

  const scoreData = getScoreGrade(overallScore)

  const getImpactColor = (impact: string) => {
    const lower = impact.toLowerCase()
    if (lower.includes('high')) {
      const colors = getScoreColors(90) // Use success colors
      return `${colors.bg} ${colors.text} ${colors.border}`
    }
    if (lower.includes('medium')) {
      const colors = getCategoryColors('content') // Use primary colors
      return `bg-[var(--ds-primary-light)] text-[var(--ds-primary)] border-[var(--ds-primary)]`
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStageColors = (stage?: string) => {
    if (!stage) return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    if (stage === 'beginner') {
      const colors = getScoreColors(85) // Success colors
      return { bg: colors.bg, text: colors.text, border: colors.border }
    }
    if (stage === 'growing') {
      const colors = getCategoryColors('content') // Primary colors
      return { bg: 'bg-[var(--ds-primary-light)]', text: 'text-[var(--ds-primary)]', border: 'border-[var(--ds-primary)]' }
    }
    if (stage === 'established') return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
    const colors = getScoreColors(65) // Warning colors
    return { bg: colors.bg, text: colors.text, border: colors.border }
  }

  const stageColors = getStageColors(data.stageInfo?.stage)

  return (
    <div className="space-y-6">
      {/* Stage Badge & Message (v3) */}
      {data.stageInfo && data.stageMessage && (
        <div className={`card p-6 border-2 ${stageColors.border} ${stageColors.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{data.stageInfo.icon}</span>
            <div>
              <div className={`text-sm font-bold ${stageColors.text}`}>{data.stageInfo.label}</div>
              <div className={`text-xs ${stageColors.text} opacity-75`}>{data.stageInfo.followerRange} • {data.stageInfo.focus}</div>
            </div>
          </div>
          <p className={`text-sm ${stageColors.text} leading-relaxed`}>{data.stageMessage}</p>
        </div>
      )}
      
      {/* Header with Overall Score */}
      <div className={`card p-6 border-2 ${scoreData.border} ${scoreData.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full ${scoreData.bg} border-4 ${scoreData.border} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${scoreData.color}`}>{scoreData.grade}</div>
                <div className={`text-xs ${scoreData.color} opacity-75`}>{overallScore}/100</div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--ds-warning)]" />
                Creator Intelligence Report
              </h2>
              <p className="text-sm text-[var(--muted-fg)] mt-1">
                Sources: {data.sources.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex h-9 items-center px-3 rounded-[10px] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AuditKPI 
          label="Total Audience" 
          value={data.audience.totalFollowers.toLocaleString()} 
          icon={<Users className="size-4" />} 
        />
        <AuditKPI 
          label="Avg Engagement" 
          value={`${(data.audience.avgEngagement * 100).toFixed(1)}%`} 
          icon={<Heart className="size-4" />} 
        />
        <AuditKPI 
          label="Reach Rate" 
          value={`${(data.audience.reachRate * 100).toFixed(1)}%`} 
          icon={<BarChart2 className="size-4" />} 
        />
        <AuditKPI 
          label="Avg Likes" 
          value={data.audience.avgLikes.toFixed(0)} 
          icon={<TrendingUp className="size-4" />} 
        />
      </div>

      {/* Creator Profile Card */}
      {data.creatorProfile && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Creator Profile
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-[var(--muted-fg)] mb-1">Stage</div>
              <div className="text-base font-semibold text-[var(--fg)]">{data.creatorProfile.stage}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-[var(--muted-fg)] mb-1">Niche</div>
              <div className="text-sm text-[var(--fg)]">{data.creatorProfile.niche}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-[var(--muted-fg)] mb-1">Audience Size</div>
              <div className="text-base font-semibold text-[var(--fg)]">{data.creatorProfile.audienceSize?.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-[var(--muted-fg)] mb-1">Engagement Rate</div>
              <div className="text-sm text-[var(--fg)]">{data.creatorProfile.engagementRate}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--muted-fg)] mb-2">Content Pillars</div>
            <div className="flex flex-wrap gap-2">
              {data.creatorProfile.contentPillars?.map((pillar, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium border border-purple-200"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--muted-fg)] mb-2">Unique Strengths</div>
            <ul className="list-disc list-inside space-y-1">
              {data.creatorProfile.uniqueStrengths?.map((strength, idx) => (
                <li key={idx} className="text-gray-700">{strength}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Growth Trajectory
            </div>
            <div className="text-sm text-purple-800 font-medium">{data.creatorProfile.growthTrajectory}</div>
          </div>
        </div>
      )}

      {/* Brand Fit Analysis - New Simplified Schema */}
      {data.brandFitAnalysis && (
        <div className="card p-6 space-y-4 bg-green-50 border-2 border-green-300">
          <h3 className="text-lg font-bold flex items-center gap-2 text-green-700">
            <Target className="w-5 h-5 text-green-700" />
            Brand Fit Analysis
          </h3>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-green-700 mb-2">Ideal Brand Types</div>
            <div className="flex flex-wrap gap-2">
              {data.brandFitAnalysis.idealBrandTypes?.map((type, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-green-700 mb-2">Why Brands Want You</div>
            <ul className="list-disc list-inside space-y-1">
              {data.brandFitAnalysis.whyBrandsWantYou?.map((reason, idx) => (
                <li key={idx} className="text-green-800">{reason}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300">
            <div className="text-sm text-green-700 mb-1">Estimated Sponsorship Value</div>
            <div className="text-2xl font-bold text-green-600">
              {data.brandFitAnalysis.estimatedValue}
            </div>
          </div>
        </div>
      )}

      {/* Brand Partnership Fit - Legacy */}
      {data.brandFit && (
        <div className="card p-6 space-y-4 bg-blue-50 border-2 border-blue-300">
          <h3 className="text-lg font-bold flex items-center gap-2 text-blue-700">
            <Target className="w-5 h-5 text-blue-700" />
            Brand Partnership Fit
          </h3>

          {/* Partnership Readiness Badge */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ds-success-light)] border-2 border-[var(--ds-success)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--ds-success-hover)]" />
                <span className="text-sm font-bold text-[var(--ds-success-hover)]">{data.brandFit.partnershipReadiness}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--ds-primary)] font-medium">Estimated CPM</div>
              <div className="text-2xl font-bold text-[var(--ds-primary)]">{data.brandFit.estimatedCPM}</div>
            </div>
          </div>

          {/* Ideal Industries */}
          <div>
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Ideal Industries
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandFit.idealIndustries.map((industry, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[var(--ds-primary-light)] text-[var(--ds-primary)] text-sm font-medium border border-[var(--ds-primary)]"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Target Product Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandFit.productCategories.map((category, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-900 text-xs font-medium border border-cyan-200"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Brand Types */}
          <div>
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Brand Positioning Fit
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandFit.brandTypes.map((type, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-900 text-sm font-medium border border-indigo-200"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-white/70 p-4 rounded-lg border border-[var(--ds-primary)]">
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Audience Demographics
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-[var(--ds-primary)] mb-1">Age Range</div>
                <div className="text-sm font-bold text-[var(--ds-primary)]">{data.brandFit.audienceDemographics.primaryAgeRange}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ds-primary)] mb-1">Gender Split</div>
                <div className="text-sm font-bold text-[var(--ds-primary)]">{data.brandFit.audienceDemographics.genderSkew}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--ds-primary)] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Top Markets
                </div>
                <div className="text-xs font-medium text-[var(--ds-primary)]">
                  {data.brandFit.audienceDemographics.topGeoMarkets.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Interests */}
          <div>
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-2">Audience Interests</div>
            <div className="flex flex-wrap gap-2">
              {data.brandFit.audienceInterests.map((interest, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[var(--ds-primary-light)] text-[var(--ds-primary)] text-xs border border-[var(--ds-primary)]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Partnership Style */}
          <div className={`bg-gradient-to-r ${getProgressGradient('content')} bg-opacity-10 p-4 rounded-lg border border-[var(--ds-primary)]`}>
            <div className="text-sm font-medium text-[var(--ds-primary)] mb-1">Partnership Style</div>
            <div className="text-sm text-[var(--ds-primary)]">{data.brandFit.partnershipStyle}</div>
          </div>
        </div>
      )}

      {/* Content Analysis - New Simplified Schema */}
      {data.contentAnalysis && (
        <div className="card p-6 space-y-4 bg-purple-50 border-2 border-purple-300">
          <h3 className="text-lg font-bold flex items-center gap-2 text-purple-700">
            <BarChart2 className="w-5 h-5 text-purple-700" />
            Content Analysis
          </h3>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-purple-700 mb-2">Top Performing Content Types</div>
            <div className="flex flex-wrap gap-2">
              {data.contentAnalysis.topPerformingTypes?.map((type, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium border border-purple-200"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-purple-700 mb-2">Content Gaps to Fill</div>
            <ul className="list-disc list-inside space-y-1">
              {data.contentAnalysis.contentGaps?.map((gap, idx) => (
                <li key={idx} className="text-purple-800">{gap}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="text-sm font-medium text-purple-700 mb-1">Tone & Style</div>
            <div className="text-purple-800">{data.contentAnalysis.toneAndStyle}</div>
          </div>
        </div>
      )}

      {/* Actionable Strategy - New Simplified Schema */}
      {data.actionableStrategy && (
        <div className="card p-6 space-y-4 bg-orange-50 border-2 border-orange-300">
          <h3 className="text-lg font-bold flex items-center gap-2 text-orange-700">
            <Zap className="w-5 h-5 text-orange-700" />
            Actionable Strategy
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-red-600 mb-2">🔥 Immediate Actions</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {data.actionableStrategy.immediate?.map((action, idx) => (
                  <li key={idx} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">📅 Short-Term (1-3 months)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {data.actionableStrategy.shortTerm?.map((action, idx) => (
                  <li key={idx} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🎯 Long-Term (3-12 months)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {data.actionableStrategy.longTerm?.map((action, idx) => (
                  <li key={idx} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Next Milestones - New Simplified Schema */}
      {data.nextMilestones && data.nextMilestones.length > 0 && (
        <div className="card p-6 space-y-4 bg-green-50 border-2 border-green-300">
          <h3 className="text-lg font-bold flex items-center gap-2 text-green-700">
            <Target className="w-5 h-5 text-green-700" />
            Next Milestones
          </h3>
          
          <div className="space-y-3">
            {data.nextMilestones.map((milestone, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{milestone.milestone}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      milestone.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      milestone.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {milestone.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      milestone.impact === 'High' ? 'bg-purple-100 text-purple-800' :
                      milestone.impact === 'Medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Impact: {milestone.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Immediate Actions */}
      {data.immediateActions && data.immediateActions.length > 0 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Immediate Actions
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.immediateActions.map((action, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <div className={`px-2 py-1 rounded-md text-xs font-bold border ${getImpactColor(action.impact)}`}>
                      {action.impact}
                    </div>
                    {action.difficulty && (
                      <div className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {action.difficulty}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--muted-fg)]">
                    <Clock className="w-3 h-3" />
                    {action.timeframe}
                  </div>
                </div>
                <div className="text-sm font-medium text-[var(--fg)] leading-relaxed">
                  {action.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Opportunities */}
      {(data.strengthAreas || data.growthOpportunities) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          {data.strengthAreas && data.strengthAreas.length > 0 && (
            <div className="card p-6 space-y-4 bg-[var(--ds-success-light)] border-[var(--ds-success)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--ds-success)]">
                <Award className="w-5 h-5 text-[var(--ds-success)]" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {data.strengthAreas.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ds-success)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--ds-success)]">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Growth Opportunities */}
          {data.growthOpportunities && data.growthOpportunities.length > 0 && (
            <div className="card p-6 space-y-4 bg-[var(--ds-primary-light)] border-[var(--ds-primary)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--ds-primary)]">
                <TrendingUp className="w-5 h-5 text-[var(--ds-primary)]" />
                Growth Opportunities
              </h3>
              <ul className="space-y-2">
                {data.growthOpportunities.map((opportunity, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[var(--ds-primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--ds-primary)]">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Strategic Growth Plan */}
      {data.strategicMoves && data.strategicMoves.length > 0 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Strategic Growth Plan
          </h3>
          <div className="space-y-4">
            {data.strategicMoves.map((move, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-xl border-2 border-indigo-200 bg-indigo-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-indigo-900">{move.title}</h4>
                    <div className="text-sm text-indigo-800">
                      <span className="font-medium">Why:</span> {move.why}
                    </div>
                    <div className="text-sm text-indigo-700 bg-white/60 p-3 rounded-lg border border-indigo-200">
                      <span className="font-medium">Expected Outcome:</span> {move.expectedOutcome}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights (from original insights array) */}
      {data.insights && data.insights.length > 0 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[var(--ds-warning)]" />
            Key Insights
          </h3>
          <ul className="space-y-2">
            {data.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                <span className="text-[var(--ds-warning)] font-bold">•</span>
                <span className="text-sm text-[var(--fg)]">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function getImpactColor(impact: string) {
  const lower = impact.toLowerCase()
  if (lower.includes('high')) return 'bg-green-100 text-green-800 border-green-200'
  if (lower.includes('medium')) return 'bg-blue-100 text-blue-800 border-blue-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

