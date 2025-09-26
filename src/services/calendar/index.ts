import { log } from '@/lib/log';
export interface Slot { start: string; end: string; tz: string; }
export interface CalendarProvider {
  proposeSlots(durationMin: number, count: number): Promise<Slot[]>;
  book(slot: Slot, attendees: {email:string,name?:string}[], title: string, description?: string): Promise<{ joinUrl?: string, eventId?: string }>;
}

export async function getCalendar(_workspaceId: string): Promise<CalendarProvider> {
  return {
    async proposeSlots(durationMin, count) {
      // naive mock: next hour blocks
      const now = new Date(); const out: Slot[] = [];
      for (let i=1;i<=count;i++) {
        const start = new Date(now.getTime() + i*60*60*1000);
        const end = new Date(start.getTime() + durationMin*60*1000);
        out.push({ start: start.toISOString(), end: end.toISOString(), tz: 'UTC' });
      }
      return out;
    },
    async book(slot, attendees, title) { log.info('[CAL]', title, slot, attendees); return { joinUrl: 'https://meet.example.com/mock' }; }
  };
}
