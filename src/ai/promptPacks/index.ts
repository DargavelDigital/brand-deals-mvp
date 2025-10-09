import type { PromptPack } from '../types';
import auditV1 from './audit.insights.v1';
import auditV2 from './audit.insights.v2';
import auditV3 from './audit.insights.v3';
import matchV1 from './match.brandSearch.v1';
import outreachV1 from './outreach.email.v1';
import mediaPackCopyV1 from './outreach.mediaPackCopy.v1';

export const PROMPT_PACKS: Record<string, PromptPack[]> = {
  'audit.insights': [auditV1, auditV2, auditV3],  // v3 is now latest (stage-aware)
  'match.brandSearch': [matchV1],
  'outreach.email': [outreachV1],
  'outreach.mediaPackCopy': [mediaPackCopyV1],
};

export function loadPack(key: keyof typeof PROMPT_PACKS, version?: string) {
  const list = PROMPT_PACKS[key];
  if (!list || !list.length) throw new Error(`Prompt pack not found: ${key}`);
  if (!version) return list[list.length - 1];
  const hit = list.find(p => p.version === version);
  if (!hit) throw new Error(`Pack ${key} missing version ${version}`);
  return hit;
}

export function loadPackVersion(key: keyof typeof PROMPT_PACKS, version: string) {
  return loadPack(key, version);
}
