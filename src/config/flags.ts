export const FLAGS = {
  'match.local.enabled': process.env.MATCH_LOCAL_ENABLED === '1',
  'ai.match.v2': process.env.AI_MATCH_V2 === '1',
  'brandrun.oneTouch': process.env.BRANDRUN_ONETOUCH === '1',
  'brandrun.selectTopN': Number(process.env.BRANDRUN_SELECT_TOPN || 6),
  'ai.audit.v2': process.env.AI_AUDIT_V2 === '1',
  'mediapack.v2': process.env.MEDIAPACK_V2 === '1',
  'outreach.tones': process.env.OUTREACH_TONES === '1',
};
