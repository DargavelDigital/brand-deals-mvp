'use client';
import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type ImportKind = 'CONTACT'|'BRAND'|'DEAL';
type ImportSource = 'CSV'|'GSHEETS';

export default function ImportWizardPage() {
  const [step, setStep] = React.useState<1|2|3>(1);
  const [kind, setKind] = React.useState<ImportKind>('CONTACT');
  const [source, setSource] = React.useState<ImportSource>('CSV');
  const [file, setFile] = React.useState<File| null>(null);
  const [sheetId, setSheetId] = React.useState('');
  const [sheetRange, setSheetRange] = React.useState('Sheet1!A1:Z');
  const [jobId, setJobId] = React.useState<string>('');
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState<any[]>([]);
  const [mapping, setMapping] = React.useState<Record<string,string>>({});

  async function startImport() {
    if (source === 'CSV' && !file) return;
    let res: Response;
    if (source === 'CSV') {
      const fd = new FormData();
      fd.append('file', file!);
      fd.append('input', JSON.stringify({ kind, source }));
      res = await fetch('/api/imports/start', { method: 'POST', body: fd });
    } else {
      res = await fetch('/api/imports/start', { method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ kind, source, sheetId, sheetRange })
      });
    }
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'start failed');
    setJobId(data.jobId); setHeaders(data.headers); setPreview(data.preview);
    const auto: Record<string,string> = {};
    for (const h of data.headers) {
      const k = h.toLowerCase();
      if (k.includes('email')) auto[h]='email';
      else if (k.includes('name')) auto[h]='name';
      else if (k.includes('company')) auto[h]='company';
      else if (k.includes('domain')) auto[h]='domain';
      else if (k.includes('title')) auto[h]='title';
    }
    setMapping(auto);
    setStep(2);
  }

  async function saveMapping() {
    const res = await fetch('/api/imports/map', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ jobId, mapping })
    });
    const j = await res.json(); if (!j.ok) return alert(j.error || 'map failed');
    setStep(3);
  }

  async function runImport() {
    const res = await fetch('/api/imports/run', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ jobId })});
    const j = await res.json(); if (!j.ok) return alert(j.error || 'run failed');
    poll();
  }

  async function poll() {
    const t = setInterval(async () => {
      const r = await fetch(`/api/imports/${jobId}/status`);
      const j = await r.json();
      if (j.ok) {
        (document.getElementById('progress') as HTMLDivElement).innerText = `Processed: ${j.job.processed}`;
        if (j.job.status === 'COMPLETED') clearInterval(t);
      }
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Import Data</h1>
        <div className="text-sm text-[var(--muted-fg)]">Step {step}/3</div>
      </div>

      {/* Step 1: Source */}
      {step === 1 && (
        <Card className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Entity</label>
              <select className="w-full border rounded-md h-10 px-3" value={kind} onChange={e=>setKind(e.target.value as any)}>
                <option value="CONTACT">Contacts</option>
                <option value="BRAND">Brands</option>
                <option value="DEAL">Deals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select className="w-full border rounded-md h-10 px-3" value={source} onChange={e=>setSource(e.target.value as any)}>
                <option value="CSV">CSV</option>
                <option value="GSHEETS">Google Sheets</option>
              </select>
            </div>
          </div>

          {source === 'CSV' ? (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Upload CSV</label>
              <Input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Sheet ID</label>
                <Input value={sheetId} onChange={e=>setSheetId(e.target.value)} placeholder="1AbC..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Range</label>
                <Input value={sheetRange} onChange={e=>setSheetRange(e.target.value)} />
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button onClick={startImport} disabled={source==='CSV' && !file}>Continue</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <div className="text-sm text-[var(--muted-fg)]">Map your columns to fields.</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Column</th>
                  <th className="text-left p-2">Maps to field</th>
                </tr>
              </thead>
              <tbody>
                {headers.map(h=>(
                  <tr key={h} className="border-t">
                    <td className="p-2">{h}</td>
                    <td className="p-2">
                      <select className="border rounded-md h-8 px-2"
                        value={mapping[h] || ''}
                        onChange={e=>setMapping(m=>({ ...m, [h]: e.target.value }))}>
                        <option value="">— ignore —</option>
                        <option value="email">email</option>
                        <option value="name">name</option>
                        <option value="firstName">firstName</option>
                        <option value="lastName">lastName</option>
                        <option value="title">title</option>
                        <option value="company">company</option>
                        <option value="phone">phone</option>
                        <option value="domain">domain</option>
                        <option value="industry">industry</option>
                        <option value="brandName">brandName</option>
                        <option value="brandDomain">brandDomain</option>
                        <option value="value">value</option>
                        <option value="notes">notes</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={()=>setStep(1)}>Back</Button>
            <Button onClick={saveMapping}>Save Mapping</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Run */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <div className="text-sm text-[var(--muted-fg)]">Preview of first few rows</div>
          <div className="overflow-auto border rounded">
            <table className="min-w-[600px] text-sm">
              <thead>
                <tr>{headers.map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.slice(0,10).map((r,i)=>(
                  <tr key={i} className="border-t">
                    {headers.map(h=><td key={h} className="p-2">{r[h]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="progress" className="text-sm text-[var(--muted-fg)]">Processed: 0</div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>setStep(2)}>Back</Button>
            <Button onClick={runImport}>Run Import</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
