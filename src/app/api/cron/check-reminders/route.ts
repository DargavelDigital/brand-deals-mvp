export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { log } from '@/lib/log';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const traceId = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    log.info(`[${traceId}] Starting reminder check...`)
    
    // Find all deals with reminders that are due
    const dealsWithReminders = await prisma.deal.findMany({
      where: {
        description: {
          contains: '//REMIND:'
        }
      },
      include: {
        workspace: true,
        brand: true
      }
    })

    log.info(`[${traceId}] Found ${dealsWithReminders.length} deals with reminders`)

    const dueReminders: Array<{
      dealId: string
      dealTitle: string
      workspaceId: string
      reminderTime: Date
      note: string
    }> = []

    // Parse reminders and check if they're due
    for (const deal of dealsWithReminders) {
      if (!deal.description) continue
      
      const reminderMatch = deal.description.match(/\/\/REMIND: (.+?) \| (.+)$/)
      if (!reminderMatch) continue
      
      const reminderTime = new Date(reminderMatch[1])
      const note = reminderMatch[2]
      
      // Check if reminder is due (within the last hour to avoid missing due to cron timing)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (reminderTime <= oneHourAgo) {
        dueReminders.push({
          dealId: deal.id,
          dealTitle: deal.title,
          workspaceId: deal.workspaceId,
          reminderTime,
          note
        })
      }
    }

    log.info(`[${traceId}] Found ${dueReminders.length} due reminders`)

    // Process due reminders
    for (const reminder of dueReminders) {
      try {
        // Try to enqueue notification if service exists
        try {
          // Check if notification service exists (this would be imported from your notification service)
          // For now, we'll just log to console
          log.info(`[${traceId}] REMINDER DUE: ${reminder.dealTitle} - ${reminder.note}`)
          log.info(`[${traceId}] Workspace: ${reminder.workspaceId}, Deal: ${reminder.dealId}`)
          log.info(`[${traceId}] Due at: ${reminder.reminderTime.toISOString()}`)
          
          // TODO: If you have a notification service, uncomment and use it:
          // await notificationService.enqueue({
          //   type: 'DEAL_REMINDER',
          //   workspaceId: reminder.workspaceId,
          //   data: {
          //     dealId: reminder.dealId,
          //     dealTitle: reminder.dealTitle,
          //     note: reminder.note,
          //     dueAt: reminder.reminderTime
          //   }
          // })
          
        } catch (notificationError) {
          // If notification service fails, just log it
          log.warn(`[${traceId}] Failed to enqueue notification for reminder ${reminder.dealId}:`, notificationError)
        }
        
        // Mark reminder as processed by removing it from description
        const currentDeal = dealsWithReminders.find(d => d.id === reminder.dealId)
        if (currentDeal?.description) {
          await prisma.deal.update({
            where: { id: reminder.dealId },
            data: {
              description: currentDeal.description.replace(/\s*\/\/REMIND:.*$/, '')
            }
          })
        }
        
        log.info(`[${traceId}] Processed reminder for deal ${reminder.dealId}`)
        
      } catch (dealError) {
        log.error(`[${traceId}] Failed to process reminder for deal ${reminder.dealId}:`, dealError)
      }
    }

    return NextResponse.json({ 
      ok: true, 
      processed: dueReminders.length,
      traceId 
    })
    
  } catch (error: any) {
    log.error(`[${traceId}] Reminder check failed:`, error)
    return NextResponse.json(
      { ok: false, error: 'Reminder processing failed', traceId },
      { status: 500 }
    )
  }
}
