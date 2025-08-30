import crypto from 'node:crypto';
import { isOn } from '@/config/flags';

export type Variant = 'control'|'playbook';

export function assignAB(workspaceId: string, brandKey: string, salt='netfx_ab_v1'): Variant {
  if (!isOn('netfx.ab.enabled')) return 'playbook'; // default to playbook when A/B disabled
  const hash = crypto.createHash('sha256').update(`${salt}:${workspaceId}:${brandKey}`).digest();
  const n = hash[0]; // 0-255
  const p = n / 255;
  return p < 0.6 ? 'control' : 'playbook'; // 60/40 split (control/playbook)
}
