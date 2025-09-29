'use client'
import { useState, useEffect } from 'react'
import { Instagram, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface InstagramProfile {
  id: string
  username: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

interface InstagramInsights {
  range: string
  totals: Record<string, number>
  series: Array<{ date: string; metrics: Record<string, number> }>
}

interface InstagramOverviewProps {
  onConnect?: () => void
}

export default function InstagramOverview({ onConnect }: InstagramOverviewProps) {
  const [profile, setProfile] = useState<InstagramProfile | null>(null)
  const [insights, setInsights] = useState<InstagramInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch profile and insights in parallel
        const [profileRes, insightsRes] = await Promise.all([
          fetch('/api/instagram/me'),
          fetch('/api/instagram/insights?range=30d')
        ])

        const profileData = await profileRes.json()
        const insightsData = await insightsRes.json()

        if (profileData.ok && profileData.connected) {
          setProfile(profileData.profile)
        } else {
          setError('Not connected to Instagram')
          return
        }

        if (insightsData.ok) {
          setInsights(insightsData)
        }
      } catch (err) {
        console.error('Failed to fetch Instagram data:', err)
        setError('Failed to load Instagram data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/instagram/auth/start')
      const data = await response.json()
      
      if (data.ok && data.configured && data.authUrl) {
        window.location.href = data.authUrl
      } else if (onConnect) {
        onConnect()
      }
    } catch (err) {
      console.error('Failed to start Instagram auth:', err)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Instagram className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Connect Instagram</h3>
            <p className="text-gray-600 text-sm">
              Connect your Instagram account to view insights and analytics
            </p>
          </div>
          <Button onClick={handleConnect} className="w-full">
            Connect Instagram
          </Button>
        </div>
      </Card>
    )
  }

  // Calculate trend for impressions (simple comparison of first vs last week)
  const getTrend = (metric: string) => {
    if (!insights?.series || insights.series.length < 14) return null
    
    const firstWeek = insights.series.slice(0, 7)
    const lastWeek = insights.series.slice(-7)
    
    const firstWeekTotal = firstWeek.reduce((sum, day) => sum + (day.metrics[metric] || 0), 0)
    const lastWeekTotal = lastWeek.reduce((sum, day) => sum + (day.metrics[metric] || 0), 0)
    
    if (firstWeekTotal === 0) return null
    
    const change = ((lastWeekTotal - firstWeekTotal) / firstWeekTotal) * 100
    return Math.round(change)
  }

  const impressionsTrend = getTrend('impressions')
  const reachTrend = getTrend('reach')

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          {profile.profile_picture_url ? (
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={profile.profile_picture_url} 
              alt={profile.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">@{profile.username}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{profile.followers_count?.toLocaleString() || '0'} followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Instagram className="w-4 h-4" />
                <span>{profile.media_count || '0'} posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {insights && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Impressions</span>
                {impressionsTrend !== null && (
                  <div className={`flex items-center space-x-1 text-xs ${
                    impressionsTrend > 0 ? 'text-green-600' : impressionsTrend < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${impressionsTrend < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(impressionsTrend)}%</span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold">
                {insights.totals.impressions?.toLocaleString() || '0'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach</span>
                {reachTrend !== null && (
                  <div className={`flex items-center space-x-1 text-xs ${
                    reachTrend > 0 ? 'text-green-600' : reachTrend < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${reachTrend < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(reachTrend)}%</span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold">
                {insights.totals.reach?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
