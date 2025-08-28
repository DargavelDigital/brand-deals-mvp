export function makeDeterministicStub(packKey: string, input: any) {
  switch (packKey) {
    case 'audit.insights.v1':
      return { 
        highlights: ['Dry-run: consistent posting', 'Dry-run: strong ER'], 
        risks: ['Dry-run: story drop'], 
        actions: ['Dry-run: post 3x/wk'] 
      }
    case 'match.brandSearch.v1':
      return { 
        results: [{
          name: 'Dry Local Cafe', 
          score: 88, 
          rationale: 'Near your audience; uses creators', 
          pitch: 'UGC + reels'
        }] 
      }
    case 'outreach.email.v1':
      return { 
        subject: 'Dry-run subject', 
        body: 'Hi {{first_name}}, this is a dry-run email preview.' 
      }
    default:
      return { ok: true, note: 'dry-run default' }
  }
}
