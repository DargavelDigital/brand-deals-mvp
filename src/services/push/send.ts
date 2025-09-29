import webpush from 'web-push';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';

const VAPID_PUBLIC_KEY  = env.VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY!
const VAPID_SUBJECT     = env.VAPID_SUBJECT || 'mailto:ops@yourdomain.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function pushToWorkspace(workspaceId: string, payload: any) {
  const subs = await prisma().pushSubscription.findMany({
    where: { workspaceId, disabled: false }
  })
  const json = JSON.stringify(payload)
  await Promise.all(subs.map(async s => {
    try {
      await webpush.sendNotification({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      } as any, json)
    } catch (e:any) {
      if (e?.statusCode === 410 || e?.statusCode === 404) {
        await prisma().pushSubscription.update({ where: { endpoint: s.endpoint }, data: { disabled: true } })
      }
    }
  }))
}
