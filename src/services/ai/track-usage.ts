import { prisma } from '@/lib/prisma';
import { calculateAICost, formatCost } from '@/lib/ai-costs';

export async function trackAIUsage(params: {
  workspaceId: string;
  userId?: string;
  feature: string; // 'audit', 'brand_research', 'media_pack', etc.
  model: string;
  provider: 'openai' | 'perplexity' | 'anthropic';
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  requestId?: string;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}) {
  const costs = calculateAICost(params.model, params.usage);
  
  try {
    const log = await prisma().aiUsageLog.create({
      data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        feature: params.feature,
        model: params.model,
        provider: params.provider,
        promptTokens: params.usage.prompt_tokens,
        completionTokens: params.usage.completion_tokens,
        totalTokens: params.usage.total_tokens,
        inputCost: costs.inputCost,
        outputCost: costs.outputCost,
        totalCost: costs.totalCost,
        requestId: params.requestId,
        duration: params.duration,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
      },
    });
    
    console.log(`💰 AI Usage Tracked: ${params.feature} | ${params.model} | ${params.usage.total_tokens} tokens | ${formatCost(costs.totalCost)}`);
    
    return log;
  } catch (error) {
    console.error('❌ Failed to track AI usage:', error);
    // Don't throw - tracking failure shouldn't break the app
    return null;
  }
}

// Helper to get cost summary for a workspace
export async function getWorkspaceCostSummary(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date
) {
  const where: any = { workspaceId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  const logs = await prisma().aiUsageLog.findMany({ where });
  
  const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalRequests = logs.length;
  
  const byProvider = logs.reduce((acc, log) => {
    if (!acc[log.provider]) {
      acc[log.provider] = { cost: 0, requests: 0, tokens: 0 };
    }
    acc[log.provider].cost += log.totalCost;
    acc[log.provider].requests += 1;
    acc[log.provider].tokens += log.totalTokens;
    return acc;
  }, {} as Record<string, { cost: number; requests: number; tokens: number }>);
  
  const byFeature = logs.reduce((acc, log) => {
    if (!acc[log.feature]) {
      acc[log.feature] = { cost: 0, requests: 0, tokens: 0 };
    }
    acc[log.feature].cost += log.totalCost;
    acc[log.feature].requests += 1;
    acc[log.feature].tokens += log.totalTokens;
    return acc;
  }, {} as Record<string, { cost: number; requests: number; tokens: number }>);
  
  return {
    totalCost,
    totalTokens,
    totalRequests,
    byProvider,
    byFeature,
  };
}

