import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    // Build context information
    context: process.env.CONTEXT,      // production | branch-deploy | deploy-preview
    branch: process.env.BRANCH,        // dev | staging | prod | main
    commit: process.env.COMMIT_REF,
    url: process.env.URL,
    deployUrl: process.env.DEPLOY_URL,
    // Environment information
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    // Timestamp
    ts: new Date().toISOString(),
  });
}
