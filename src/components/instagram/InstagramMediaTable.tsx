'use client'
import { useState, useEffect } from 'react'
import { Instagram, Heart, MessageCircle, ExternalLink, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface InstagramMedia {
  id: string
  caption?: string | null
  media_type: string
  media_url?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
  thumbnail_url?: string
}

interface InstagramInsight {
  name: string
  period: string
  values: Array<{
    value: Record<string, unknown>
    end_time: string
  }>
}

interface InstagramMediaTableProps {
  limit?: number
}

export default function InstagramMediaTable({ limit = 25 }: InstagramMediaTableProps) {
  const [media, setMedia] = useState<InstagramMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia | null>(null)
  const [insights, setInsights] = useState<InstagramInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/instagram/media?limit=${limit}`)
        const data = await response.json()

        if (data.ok) {
          setMedia(data.data || [])
        } else {
          setError(data.error || 'Failed to load media')
        }
      } catch (err) {
        console.error('Failed to fetch Instagram media:', err)
        setError('Failed to load media')
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [limit])

  const fetchInsights = async (mediaId: string) => {
    try {
      setInsightsLoading(true)
      const response = await fetch(`/api/instagram/media/${mediaId}/insights`)
      const data = await response.json()

      if (data.ok) {
        setInsights(data.metrics || [])
      }
    } catch (err) {
      console.error('Failed to fetch media insights:', err)
    } finally {
      setInsightsLoading(false)
    }
  }

  const handleMediaClick = (media: InstagramMedia) => {
    setSelectedMedia(media)
    fetchInsights(media.id)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const truncateCaption = (caption: string | null | undefined, maxLength: number = 50) => {
    if (!caption) return ''
    return caption.length > maxLength ? `${caption.substring(0, maxLength)}...` : caption
  }

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'VIDEO':
        return '🎥'
      case 'CAROUSEL_ALBUM':
        return '📸'
      case 'IMAGE':
      default:
        return '📷'
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Instagram className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Unable to Load Media</h3>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (media.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Instagram className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No Media Found</h3>
            <p className="text-gray-600 text-sm">No posts found for this Instagram account</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Posts</h3>
          <span className="text-sm text-gray-600">{media.length} posts</span>
        </div>

        <div className="space-y-3">
          {media.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-colors"
              onClick={() => handleMediaClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleMediaClick(item)
                }
              }}
            >
              {/* Media Thumbnail */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.thumbnail_url || item.media_url ? (
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.thumbnail_url || item.media_url} 
                    alt="Media thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-2xl">{getMediaTypeIcon(item.media_type)}</span>
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{formatDate(item.timestamp)}</span>
                  <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getMediaTypeIcon(item.media_type)} {item.media_type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate">
                  {truncateCaption(item.caption)}
                </p>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{item.like_count?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{item.comments_count?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>

              {/* External Link */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(item.permalink, '_blank')
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Insights Modal/Drawer */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Post Insights</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMedia(null)}
                  >
                    ×
                  </Button>
                </div>

                {/* Media Preview */}
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {selectedMedia.thumbnail_url || selectedMedia.media_url ? (
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedMedia.thumbnail_url || selectedMedia.media_url} 
                        alt="Media preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">{getMediaTypeIcon(selectedMedia.media_type)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {selectedMedia.caption || 'No caption'}
                  </p>
                </div>

                {/* Insights */}
                {insightsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2 capitalize">
                          {insight.name.replace(/_/g, ' ')}
                        </h4>
                        <div className="text-2xl font-bold">
                          {insight.values[0]?.value 
                            ? (typeof insight.values[0].value === 'object' 
                                ? Object.values(insight.values[0].value).reduce((sum: number, v: unknown) => sum + (typeof v === 'number' ? v : 0), 0)
                                : insight.values[0].value
                              ).toLocaleString()
                            : '0'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No insights available for this post</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
