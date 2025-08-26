import { z } from 'zod'

export const OfMetrics = z.object({
  audience: z.object({
    subs: z.number().nonnegative().default(0),
    churnRate: z.number().min(0).max(1).default(0),
    topGeo: z.array(z.string()).default([]),
  }),
  performance: z.object({
    revenueLast30: z.number().nonnegative().default(0),
    avgLikes: z.number().nonnegative().default(0),
    avgComments: z.number().nonnegative().default(0),
    avgMessages: z.number().nonnegative().default(0),
  }),
  contentSignals: z.array(z.string()).default([]),
})
export type TOfMetrics = z.infer<typeof OfMetrics>

export type OfConn = {
  workspaceId: string
  provider: 'ofauth' | 'onlyfansapi' | 'manual'
  accessToken?: string
  refreshToken?: string
  accountId?: string
  username?: string
  expiresAt?: string
}

export type OfResult<T> = { ok:true; data:T } | { ok:false; error:string }
