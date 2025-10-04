import { z } from 'zod'

export const MediaPackMetricsSchema = z.object({
  followers: z.number().optional(),
  avgViews: z.number().optional(),
  avgLikes: z.number().optional(),
  avgComments: z.number().optional(),
  engagementRate: z.number().optional(),
})

export const MediaPackPostSchema = z.object({
  id: z.string().optional(),
  platform: z.string().optional(),
  url: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().optional(),
  likes: z.number().optional(),
  views: z.number().optional(),
  comments: z.number().optional(),
})

export const MediaPackPaletteSchema = z.object({
  primary: z.string().optional(), // hex like #123456
  secondary: z.string().optional(),
  accent: z.string().optional(),
})

export const MediaPackCreatorSchema = z.object({
  displayName: z.string().default('Creator Name'),
  handle: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  niche: z.string().optional(),
  location: z.string().optional(),
  metrics: MediaPackMetricsSchema.default({}),
})

export const MediaPackBrandSchema = z.object({
  name: z.string().default('Brand'),
  logoUrl: z.string().url().optional(),
  colors: MediaPackPaletteSchema.default({}),
})

export const MediaPackDataSchema = z.object({
  creator: MediaPackCreatorSchema,
  brand: MediaPackBrandSchema,
  summary: z.string().optional(),
  proposalIdeas: z.array(z.string()).default([]),
  topPosts: z.array(MediaPackPostSchema).default([]),
  palette: MediaPackPaletteSchema.default({}),
  // any extra fields the preview needs:
  statsCards: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
})

export type MediaPackData = z.infer<typeof MediaPackDataSchema>
