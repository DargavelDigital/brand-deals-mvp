export type YtVideo = {
  id: string
  title: string
  publishedAt: string
  views: number
  likes?: number
  comments?: number
  tags?: string[]
}

export type IgPost = {
  id: string
  timestamp: string
  likeCount?: number
  commentsCount?: number
}

export type TtVideo = {
  id: string
  createTime: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
}

export type Snapshot = {
  youtube?: {
    channelId: string
    title?: string
    url?: string
    subscribers: number
    totalViews: number
    videos: YtVideo[]
    topKeywords: string[]
  }
  instagram?: {
    igUserId: string
    username?: string
    followers: number
    posts: IgPost[]
    avgEngagementRate?: number
  }
  tiktok?: {
    businessId: string
    username?: string
    followers: number
    videos: TtVideo[]
    avgEngagementRate?: number
  }
  derived?: {
    contentThemes?: string[]
    globalEngagementRate?: number
  }
}
