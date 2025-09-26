import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    context: process.env.CONTEXT,      // production | branch-deploy | deploy-preview
    branch: process.env.BRANCH,        // dev | staging | prod | main
    commit: process.env.COMMIT_REF,
    url: process.env.URL,
    deployUrl: process.env.DEPLOY_URL,
    ts: new Date().toISOString(),
  });
}
