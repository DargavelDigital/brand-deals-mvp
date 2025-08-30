'use client'
import * as React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Step = { key: string; status: 'idle'|'running'|'ok'|'error'; error?: string };

export default function OneTouchSheet({ open, onClose }:{
  open: boolean; onClose: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [steps, setSteps] = React.useState<Step[]>([]);
  const [sequenceId, setSequenceId] = React.useState<string|undefined>(undefined);
  const [done, setDone] = React.useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch('/api/brand-run/one-touch', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const { summary } = await res.json();
      setSteps(summary.stepStatuses?.steps || []);
      setSequenceId(summary.artifacts?.outreach?.sequenceId);
      setDone(!!summary.completed);
    } catch (e:any) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { if (open) start(); }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-[var(--card)] shadow-xl p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">One-Touch Brand Run</h2>
          <button className="text-[var(--muted-fg)]" onClick={onClose}>Close</button>
        </div>

        <Card className="p-4">
          <div data-testid="progress-sheet" className="space-y-3">
            {[
              'connections','audit','match','select','mediapack','contacts','outreach','complete'
            ].map(k => {
              const s = steps.find(x => x.key === k);
              const status = s?.status || 'idle';
              return (
                <div key={k} className="flex items-center justify-between">
                  <div className="text-sm capitalize">{k}</div>
                  <div>
                    {status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-600)]" />}
                    {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />}
                    {status === 'error' && <XCircle className="w-4 h-4 text-[var(--error)]" />}
                    {status === 'idle' && <span className="text-[var(--muted-fg)] text-xs">pending</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[var(--muted-fg)]">
            {loading ? 'Running…' : done ? 'Completed' : 'Processing'}
          </div>
          {done && sequenceId && (
            <Button data-testid="review-send" onClick={() => (window.location.href = '/tools/outreach')}>
              Review & Send
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
