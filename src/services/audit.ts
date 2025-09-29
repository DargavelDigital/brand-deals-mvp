export interface AuditResult {
  audience: {
    size: number;
    topGeo: string;
    topAge: string;
    engagementRate: string;
  };
  insights: string[];
  similarCreators: Array<{
    handle: string;
    platform: string;
  }>;
}

export interface AuditParams {
  workspaceId: string;
  socialAccounts: string[];
}

export const audit = {
  run: async (params: AuditParams): Promise<AuditResult> => {
    // TODO: Implement real audit service
    // For now, return mock data
    return {
      audience: {
        size: 185000,
        topGeo: "US/UK",
        topAge: "18–24",
        engagementRate: "4.8%"
      },
      insights: [
        "Your audience strongly over-indexes for athleisure & wellness brands.",
        "Similar creators to you have worked with Gymshark, Lululemon, Nike.",
        "Reels outperform posts by 2.1× on average."
      ],
      similarCreators: [
        { handle: "@fitkatie", platform: "instagram" },
        { handle: "@cardioj", platform: "tiktok" }
      ]
    };
  }
};

// If a real implementation exists, export that instead.
// Minimal placeholder that won't run during static export unless called.
export async function getLatestAudit(workspaceId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma().audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export default getLatestAudit;
