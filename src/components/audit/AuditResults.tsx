'use client'
import * as React from 'react'
import AuditKPI from './AuditKPI'
import SparkBar from './SparkBar'
import { Users, Heart, BarChart2, Share2, TrendingUp, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons'
import AdaptiveBadge from '@/components/ui/AdaptiveBadge'
import { useLocale } from 'next-intl'
import { getScoreColors, getProgressGradient } from '@/lib/audit-colors'

type Similar = { name:string; platform:string; reason:string; audienceSize:string }
export type AuditResultFront = {
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
  similarCreators: Similar[]
  // Enhanced comprehensive analysis fields
  brandFitAnalysis?: {
    idealBrandTypes?: string[]
    brandCategories?: Record<string, { score: number; reasoning: string }>
    whyBrandsWantYou?: string[]
    pricingPower?: {
      estimatedSponsorshipValue?: string
      packageOptions?: string[]
    }
  }
  contentAnalysis?: {
    bestPerformingPosts?: Array<{
      type: string
      avgEngagement: string
      topic: string
    }>
    contentGaps?: string[]
    toneAndStyle?: string
  }
  competitiveAnalysis?: {
    similarCreators?: string[]
    yourAdvantages?: string[]
    areasToDevelop?: string[]
  }
  actionableStrategy?: {
    immediate?: string[]
    shortTerm?: string[]
    longTerm?: string[]
  }
  mediaKitRecommendations?: {
    mustInclude?: string[]
    pricingStructure?: string
    uniqueSellingPoints?: string[]
  }
}

export default function AuditResults({ data, onRefresh }:{
  data: AuditResultFront
  onRefresh: ()=>void
}){
  const locale = useLocale()
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    brandFit: false,
    content: false,
    competitive: false,
    strategy: false,
    mediaKit: false
  })
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  const bars = React.useMemo(()=>[
    Math.round(data.audience.avgLikes),
    Math.round(data.audience.avgComments),
    Math.round(data.audience.avgShares),
    Math.round(data.audience.reachRate*100),
    Math.round(data.audience.avgEngagement*100),
  ], [data])

  // Calculate overall score based on engagement and reach
  const overallScore = React.useMemo(() => {
    const engagement = data.audience.avgEngagement * 100
    const reach = data.audience.reachRate * 100
    const score = (engagement * 0.6) + (reach * 0.4) // Weighted score
    return Math.min(100, Math.round(score * 20)) // Scale to 100
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

  // Extract strengths and improvements from insights
  const strengths = data.insights.filter((_, i) => i % 3 === 0).slice(0, 3)
  const improvements = data.insights.filter((_, i) => i % 3 === 1).slice(0, 3)
  const recommendations = data.insights.filter((_, i) => i % 3 === 2).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
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
                Audit Results
              </h2>
              <p className="text-sm text-[var(--muted-fg)] mt-1">
                Sources: {data.sources.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex h-9 items-center px-3 rounded-[10px] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AuditKPI label="Total Audience" value={data.audience.totalFollowers.toLocaleString()} icon={<Users className="size-4" />} />
        <AuditKPI label="Avg Engagement" value={`${(data.audience.avgEngagement*100).toFixed(1)}%`} icon={<Heart className="size-4" />} />
        <AuditKPI label="Reach Rate" value={`${(data.audience.reachRate*100).toFixed(1)}%`} icon={<BarChart2 className="size-4" />} />
        <AuditKPI label="Avg Shares" value={data.audience.avgShares.toFixed(0)} icon={<Share2 className="size-4" />} />
      </div>

      {/* Key Strengths */}
      {strengths.length > 0 && (
        <div className="card p-6 border-l-4 border-[var(--ds-success)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--ds-success)]" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {strengths.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--ds-success)] mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`strength_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {improvements.length > 0 && (
        <div className="card p-6 border-l-4 border-[var(--ds-warning)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--ds-warning)]" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {improvements.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--ds-warning)] mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`improvement_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card p-6 border-l-4 border-[var(--ds-primary)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--ds-primary)]" />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {recommendations.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--ds-primary)] mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`recommendation_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Engagement Metrics Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Avg Likes</span>
              <span className="font-medium">{Math.round(data.audience.avgLikes).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressGradient('authenticity')} transition-all`}
                style={{ width: `${Math.min(100, (data.audience.avgLikes / data.audience.totalFollowers) * 10000)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Avg Comments</span>
              <span className="font-medium">{Math.round(data.audience.avgComments).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressGradient('content')} transition-all`}
                style={{ width: `${Math.min(100, (data.audience.avgComments / data.audience.totalFollowers) * 20000)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Engagement Rate</span>
              <span className="font-medium">{(data.audience.avgEngagement * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressGradient('engagement')} transition-all`}
                style={{ width: `${Math.min(100, data.audience.avgEngagement * 200)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Reach Rate</span>
              <span className="font-medium">{(data.audience.reachRate * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressGradient('growth')} transition-all`}
                style={{ width: `${Math.min(100, data.audience.reachRate * 200)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signal Snapshot */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-3">Performance Snapshot</h3>
        <SparkBar values={bars} />
        <div className="mt-3 text-xs text-[var(--muted-fg)]">Likes / Comments / Shares / Reach% / Engagement%</div>
      </div>

      {/* 1. BRAND FIT ANALYSIS */}
      {data.brandFitAnalysis && (
        <div className="card p-6">
          <button
            onClick={() => toggleSection('brandFit')}
            className="w-full flex items-center justify-between text-left hover:opacity-75 transition-opacity"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🎯 Brand Fit Analysis
            </h3>
            <span className="text-2xl">{expandedSections.brandFit ? '−' : '+'}</span>
          </button>
          
          {expandedSections.brandFit && (
            <div className="mt-4 space-y-6">
              {/* Ideal Brand Types */}
              {data.brandFitAnalysis.idealBrandTypes && data.brandFitAnalysis.idealBrandTypes.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Ideal Brand Types</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {data.brandFitAnalysis.idealBrandTypes.map((type, i) => (
                      <div key={i} className="px-3 py-2 bg-[var(--surface)] rounded-lg text-sm">
                        • {type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Brand Categories with Scores */}
              {data.brandFitAnalysis.brandCategories && Object.keys(data.brandFitAnalysis.brandCategories).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Brand Category Scores</h4>
                  <div className="space-y-3">
                    {Object.entries(data.brandFitAnalysis.brandCategories).map(([category, details]) => (
                      <div key={category} className="p-4 bg-[var(--surface)] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{category}</span>
                          <span className="text-lg font-bold text-[var(--brand-600)]">{details.score}%</span>
                        </div>
                        <p className="text-xs text-[var(--muted-fg)]">{details.reasoning}</p>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)] transition-all"
                            style={{ width: `${details.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Why Brands Want You */}
              {data.brandFitAnalysis.whyBrandsWantYou && data.brandFitAnalysis.whyBrandsWantYou.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Why Brands Want to Work With You</h4>
                  <ul className="space-y-2">
                    {data.brandFitAnalysis.whyBrandsWantYou.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-sm">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Pricing Power */}
              {data.brandFitAnalysis.pricingPower && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm mb-2 text-green-900">💰 Pricing Power</h4>
                  <p className="text-lg font-bold text-green-700 mb-3">
                    {data.brandFitAnalysis.pricingPower.estimatedSponsorshipValue}
                  </p>
                  {data.brandFitAnalysis.pricingPower.packageOptions && (
                    <div className="space-y-1">
                      {data.brandFitAnalysis.pricingPower.packageOptions.map((pkg, i) => (
                        <div key={i} className="text-sm text-gray-700">• {pkg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. CONTENT ANALYSIS */}
      {data.contentAnalysis && (
        <div className="card p-6">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between text-left hover:opacity-75 transition-opacity"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📊 Content Performance Analysis
            </h3>
            <span className="text-2xl">{expandedSections.content ? '−' : '+'}</span>
          </button>
          
          {expandedSections.content && (
            <div className="mt-4 space-y-6">
              {/* Best Performing Posts */}
              {data.contentAnalysis.bestPerformingPosts && data.contentAnalysis.bestPerformingPosts.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Best Performing Content</h4>
                  <div className="space-y-2">
                    {data.contentAnalysis.bestPerformingPosts.map((post, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg">
                        <div>
                          <span className="font-medium text-sm">{post.type}</span>
                          <span className="text-xs text-[var(--muted-fg)] ml-2">• {post.topic}</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--brand-600)]">{post.avgEngagement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Content Gaps */}
              {data.contentAnalysis.contentGaps && data.contentAnalysis.contentGaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Content Opportunities</h4>
                  <ul className="space-y-2">
                    {data.contentAnalysis.contentGaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">→</span>
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Tone and Style */}
              {data.contentAnalysis.toneAndStyle && (
                <div className="p-4 bg-[var(--surface)] rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-[var(--muted-fg)]">Your Tone & Style</h4>
                  <p className="text-sm italic">"{data.contentAnalysis.toneAndStyle}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. COMPETITIVE POSITIONING */}
      {data.competitiveAnalysis && (
        <div className="card p-6">
          <button
            onClick={() => toggleSection('competitive')}
            className="w-full flex items-center justify-between text-left hover:opacity-75 transition-opacity"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚔️ Competitive Positioning
            </h3>
            <span className="text-2xl">{expandedSections.competitive ? '−' : '+'}</span>
          </button>
          
          {expandedSections.competitive && (
            <div className="mt-4 space-y-6">
              {/* Similar Creators */}
              {data.competitiveAnalysis.similarCreators && data.competitiveAnalysis.similarCreators.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Similar Creators</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.competitiveAnalysis.similarCreators.map((creator, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {creator}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Your Advantages */}
              {data.competitiveAnalysis.yourAdvantages && data.competitiveAnalysis.yourAdvantages.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Your Competitive Advantages</h4>
                  <ul className="space-y-2">
                    {data.competitiveAnalysis.yourAdvantages.map((advantage, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">+</span>
                        <span className="text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Areas to Develop */}
              {data.competitiveAnalysis.areasToDevelop && data.competitiveAnalysis.areasToDevelop.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Areas to Develop</h4>
                  <ul className="space-y-2">
                    {data.competitiveAnalysis.areasToDevelop.map((area, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">↗</span>
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIONABLE STRATEGY */}
      {data.actionableStrategy && (
        <div className="card p-6">
          <button
            onClick={() => toggleSection('strategy')}
            className="w-full flex items-center justify-between text-left hover:opacity-75 transition-opacity"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🚀 Actionable Strategy
            </h3>
            <span className="text-2xl">{expandedSections.strategy ? '−' : '+'}</span>
          </button>
          
          {expandedSections.strategy && (
            <div className="mt-4 space-y-6">
              {/* Immediate Actions */}
              {data.actionableStrategy.immediate && data.actionableStrategy.immediate.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-sm mb-3 text-red-900">⚡ This Week (Immediate)</h4>
                  <ul className="space-y-2">
                    {data.actionableStrategy.immediate.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold mt-0.5">1.</span>
                        <span className="text-sm text-gray-800">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Short-term Strategy */}
              {data.actionableStrategy.shortTerm && data.actionableStrategy.shortTerm.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-sm mb-3 text-yellow-900">📅 Next 1-3 Months (Short-term)</h4>
                  <ul className="space-y-2">
                    {data.actionableStrategy.shortTerm.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold mt-0.5">→</span>
                        <span className="text-sm text-gray-800">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Long-term Vision */}
              {data.actionableStrategy.longTerm && data.actionableStrategy.longTerm.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm mb-3 text-blue-900">🎯 6-12 Months (Long-term)</h4>
                  <ul className="space-y-2">
                    {data.actionableStrategy.longTerm.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">★</span>
                        <span className="text-sm text-gray-800">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MEDIA KIT RECOMMENDATIONS */}
      {data.mediaKitRecommendations && (
        <div className="card p-6">
          <button
            onClick={() => toggleSection('mediaKit')}
            className="w-full flex items-center justify-between text-left hover:opacity-75 transition-opacity"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📦 Media Kit Optimization
            </h3>
            <span className="text-2xl">{expandedSections.mediaKit ? '−' : '+'}</span>
          </button>
          
          {expandedSections.mediaKit && (
            <div className="mt-4 space-y-6">
              {/* Must Include */}
              {data.mediaKitRecommendations.mustInclude && data.mediaKitRecommendations.mustInclude.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Must Include in Your Media Kit</h4>
                  <ul className="space-y-2">
                    {data.mediaKitRecommendations.mustInclude.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold mt-0.5">✓</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Pricing Structure */}
              {data.mediaKitRecommendations.pricingStructure && (
                <div className="p-4 bg-[var(--surface)] rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-[var(--muted-fg)]">Recommended Pricing Structure</h4>
                  <p className="text-sm font-medium">{data.mediaKitRecommendations.pricingStructure}</p>
                </div>
              )}
              
              {/* Unique Selling Points */}
              {data.mediaKitRecommendations.uniqueSellingPoints && data.mediaKitRecommendations.uniqueSellingPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 text-[var(--muted-fg)]">Your Unique Selling Points</h4>
                  <div className="space-y-2">
                    {data.mediaKitRecommendations.uniqueSellingPoints.map((usp, i) => (
                      <div key={i} className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                        <span className="text-sm font-medium text-purple-900">{usp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Similar Creators */}
      {data.similarCreators && data.similarCreators.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Similar Creators</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.similarCreators.slice(0,6).map((c, i)=>(
              <div key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--brand-600)] transition-colors">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-[var(--muted-fg)] mt-1">{c.platform}</div>
                <div className="text-xs text-[var(--muted-fg)] mt-2">{c.audienceSize}</div>
                <div className="text-xs mt-2 text-[var(--fg)] opacity-75">{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRefresh}
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm font-medium border-2 border-[var(--brand-600)] text-[var(--brand-600)] hover:bg-[var(--brand-50)] transition-colors"
          >
            Run New Audit
          </button>
          <a 
            href={`/${locale}/tools/matches`} 
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm font-medium text-white bg-[var(--brand-600)] hover:opacity-90 transition-opacity"
          >
            Generate Matches
          </a>
          <a 
            href={`/${locale}/tools/pack`} 
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Build Media Pack
          </a>
        </div>
        
        {/* AI Feedback Integration */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--muted-fg)]">How was this audit?</span>
            <AdaptiveBadge />
          </div>
          <AiFeedbackButtons 
            type="AUDIT" 
            targetId={`audit_${data.auditId}`}
            className="justify-start"
          />
        </div>
      </div>
    </div>
  )
}
