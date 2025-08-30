import fs from 'node:fs';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { isOn } from '@/config/flags';
import { aiInvoke } from '@/ai/aiInvoke'; // your unified AI helper
import { log } from '@/lib/logger';

const blocklistPath = process.env.SAFETY_BLOCKLIST_PATH || '';
let blockPhrases: string[] = [];
if (blocklistPath && fs.existsSync(blocklistPath)) {
  blockPhrases = fs.readFileSync(blocklistPath, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
}

export type SafetyResult = { verdict: 'PASS'|'WARN'|'BLOCK', reasons: string[], model?: string, tokens?: number };

export async function contentSafetyCheck(params: {
  workspaceId: string,
  subject?: string,
  bodyHtml?: string,
  sequenceStepId?: string
}): Promise<SafetyResult> {
  const body = params.bodyHtml || '';
  const hash = crypto.createHash('sha256').update(body).digest('hex');

  // Basic rule checks first (fast, local)
  const reasons: string[] = [];
  const lower = body.toLowerCase();
  for (const phrase of blockPhrases) {
    if (phrase && lower.includes(phrase.toLowerCase())) {
      reasons.push(`Blocked phrase: "${phrase}"`);
    }
  }
  let verdict: SafetyResult['verdict'] = reasons.length ? 'BLOCK' : 'PASS';

  // Optional: AI moderation
  let model: string | undefined;
  let tokens: number | undefined;
  if (isOn('safety.moderation')) {
    try {
      const res = await aiInvoke('safety.contentCheck.v1', {
        subject: params.subject ?? '',
        html: body
      });
      model = res._meta?.model;
      tokens = res._meta?.tokens;
      if (res.blockReasons?.length) {
        verdict = 'BLOCK';
        reasons.push(...res.blockReasons);
      } else if (res.warnReasons?.length && verdict !== 'BLOCK') {
        verdict = 'WARN';
        reasons.push(...res.warnReasons);
      }
    } catch (e: any) {
      // If AI fails, keep local verdict
      log.warn({ err: e?.message }, 'ai moderation failed, falling back to local verdict');
    }
  }

  await prisma.contentSafetyCheck.create({
    data: {
      workspaceId: params.workspaceId,
      sequenceStepId: params.sequenceStepId ?? null,
      subject: params.subject ?? null,
      bodyHash: hash,
      verdict,
      reasons,
      model: model ?? null,
      tokens: tokens ?? null
    }
  });

  return { verdict, reasons, model, tokens };
}
