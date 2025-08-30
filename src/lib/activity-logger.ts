import { prisma } from './prisma';

export interface ActivityLogData {
  workspaceId: string;
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  meta?: Record<string, any>;
}

export class ActivityLogger {
  /**
   * Log a user activity for audit trail
   */
  static async log(data: ActivityLogData) {
    try {
      await prisma.activityLog.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.userId,
          action: data.action,
          targetId: data.targetId,
          targetType: data.targetType,
          meta: data.meta ? JSON.parse(JSON.stringify(data.meta)) : null
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - logging should not break the main functionality
    }
  }

  /**
   * Log common actions with predefined formats
   */
  static async logBrandRun(workspaceId: string, userId: string, brandRunId: string, action: 'started' | 'completed' | 'failed') {
    await this.log({
      workspaceId,
      userId,
      action: `BRAND_RUN_${action.toUpperCase()}`,
      targetId: brandRunId,
      targetType: 'BRAND_RUN',
      meta: { action }
    });
  }

  static async logOutreach(workspaceId: string, userId: string, sequenceId: string, action: 'started' | 'sent' | 'replied') {
    await this.log({
      workspaceId,
      userId,
      action: `OUTREACH_${action.toUpperCase()}`,
      targetId: sequenceId,
      targetType: 'OUTREACH_SEQUENCE',
      meta: { action }
    });
  }

  static async logMediaPack(workspaceId: string, userId: string, mediaPackId: string, action: 'generated' | 'downloaded' | 'shared') {
    await this.log({
      workspaceId,
      userId,
      action: `MEDIA_PACK_${action.toUpperCase()}`,
      targetId: mediaPackId,
      targetType: 'MEDIA_PACK',
      meta: { action }
    });
  }

  static async logDeal(workspaceId: string, userId: string, dealId: string, action: 'created' | 'updated' | 'won' | 'lost') {
    await this.log({
      workspaceId,
      userId,
      action: `DEAL_${action.toUpperCase()}`,
      targetId: dealId,
      targetType: 'DEAL',
      meta: { action }
    });
  }

  static async logContact(workspaceId: string, userId: string, contactId: string, action: 'created' | 'updated' | 'imported') {
    await this.log({
      workspaceId,
      userId,
      action: `CONTACT_${action.toUpperCase()}`,
      targetId: contactId,
      targetType: 'CONTACT',
      meta: { action }
    });
  }

  static async logBrand(workspaceId: string, userId: string, brandId: string, action: 'created' | 'updated' | 'matched') {
    await this.log({
      workspaceId,
      userId,
      action: `BRAND_${action.toUpperCase()}`,
      targetId: brandId,
      targetType: 'BRAND',
      meta: { action }
    });
  }

  /**
   * Get recent activities for a workspace
   */
  static async getRecentActivities(workspaceId: string, limit: number = 50) {
    try {
      return await prisma.activityLog.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      return [];
    }
  }

  /**
   * Get activities for a specific user in a workspace
   */
  static async getUserActivities(workspaceId: string, userId: string, limit: number = 50) {
    try {
      return await prisma.activityLog.findMany({
        where: { 
          workspaceId,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }
}
