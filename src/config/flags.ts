export const FLAGS = {
  'match.local.enabled': process.env.MATCH_LOCAL_ENABLED === '1',
  'ai.match.v2': process.env.AI_MATCH_V2 === '1',
  'brandrun.oneTouch': process.env.BRANDRUN_ONETOUCH === '1',
  'brandrun.selectTopN': Number(process.env.BRANDRUN_SELECT_TOPN || 6),
  'ai.audit.v2': process.env.AI_AUDIT_V2 === '1',
  'mediapack.v2': process.env.MEDIAPACK_V2 === '1',
  'outreach.tones': process.env.OUTREACH_TONES === '1',
  
  // Epic 13: Importers, Integrations & CRM Sync
  'import.csv.enabled': process.env.IMPORT_CSV_ENABLED === '1',
  'import.sheets.enabled': process.env.IMPORT_SHEETS_ENABLED === '1',
  'crm.hubspot.enabled': process.env.CRM_HUBSPOT_ENABLED === '1',
  'crm.pipedrive.enabled': process.env.CRM_PIPEDRIVE_ENABLED === '1',
  'calendar.google.enabled': process.env.CALENDAR_GOOGLE_ENABLED === '1',
  'calendar.microsoft.enabled': process.env.CALENDAR_MICROSOFT_ENABLED === '1',
};
