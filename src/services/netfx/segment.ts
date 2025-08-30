export type Segment = {
  industry?: string;
  sizeBand?: string;
  region?: string;
  season?: 'Q1'|'Q2'|'Q3'|'Q4';
  sendDow?: number;
  sendHour?: number;
  templateFamily?: string;
  tone?: 'professional'|'relaxed'|'fun';
  stepsPlanned?: number;
  domainHash?: string | null;
};

export function deriveSegment(input: {
  brand?: { industry?: string; size?: number; region?: string; domain?: string | null };
  sendAt?: Date;
  templateKey?: string;
  tone?: Segment['tone'];
  stepsPlanned?: number;
}): Segment {
  const quarter = (d: Date) => (Math.floor(d.getUTCMonth()/3)+1) as 1|2|3|4;
  const sizeBand = (n?: number) => n==null ? undefined :
    n<=10?'1-10':n<=50?'11-50':n<=200?'51-200':n<=1000?'200-1k':'1k+';
  const sha256 = (s: string) => crypto.subtle ? 'sha256:' + s : 'sha256:' + s; // substitute if needed server-side
  const sendAt = input.sendAt ?? new Date();
  return {
    industry: input.brand?.industry?.toLowerCase(),
    sizeBand: sizeBand(input.brand?.size as any),
    region: input.brand?.region,
    season: (`Q${quarter(sendAt)}`) as Segment['season'],
    sendDow: sendAt.getUTCDay(),
    sendHour: sendAt.getUTCHours(),
    templateFamily: input.templateKey,
    tone: input.tone,
    stepsPlanned: input.stepsPlanned,
    domainHash: input.brand?.domain ? `sha256:${Buffer.from(input.brand.domain).toString('base64')}` : null, // simple pseudonymization placeholder
  }
}
