export interface CrmProvider {
  connectUrl(): Promise<string>;
  handleCallback(code: string): Promise<void>;
  isConnected(): Promise<boolean>;
  pushDeal(payload: { title: string, value?: number, contact: { email: string, name?: string }, mediaPackUrl?: string }): Promise<void>;
}

export async function getCrm(_workspaceId: string): Promise<CrmProvider> {
  // simple mock now; swap to hubspot/pipedrive adapters behind flags
  return {
    async connectUrl() { return 'https://example.com/oauth'; },
    async handleCallback() { /* store tokens */ },
    async isConnected() { return true; },
    async pushDeal(p) { console.log('[CRM] pushDeal', p.title); }
  };
}
