'use client';
import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isEnabledSocial } from '@/lib/launch';

type ImportKind = 'CONTACT'|'BRAND'|'DEAL';
type ImportSource = 'CSV'|'GSHEETS';

export default function ImportWizardPage() {
  // Check if we're in Instagram-only launch mode
  const igOnly = isEnabledSocial("instagram") && !isEnabledSocial("tiktok")
  
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
  const [enriched, setEnriched] = React.useState<any[]>([]);
  const [enriching, setEnriching] = React.useState(false);
  const [importCompleted, setImportCompleted] = React.useState(false);

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
        if (j.job.status === 'COMPLETED') {
          clearInterval(t);
          setImportCompleted(true);
        }
      }
    }, 1000);
  }

  async function enrichContacts() {
    if (kind !== 'CONTACT' || preview.length === 0) return;
    
    setEnriching(true);
    try {
      const candidates = preview.map(row => ({
        name: row[mapping.name] || row.name || '',
        email: row[mapping.email] || row.email || '',
        domain: row[mapping.domain] || row.domain || '',
        company: row[mapping.company] || row.company || '',
        title: row[mapping.title] || row.title || ''
      }));

      const res = await fetch('/api/contacts/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates })
      });

      const json = await res.json();
      if (json.ok && json.items) {
        // Merge enriched data back into preview
        const enrichedPreview = preview.map((row, index) => {
          const enriched = json.items[index];
          if (enriched) {
            return {
              ...row,
              [mapping.email || 'email']: enriched.email || row[mapping.email] || row.email,
              [mapping.title || 'title']: enriched.title || row[mapping.title] || row.title,
              linkedinUrl: enriched.linkedinUrl,
              enrichedSource: enriched.source,
              confidence: enriched.confidence
            };
          }
          return row;
        });
        setEnriched(enrichedPreview);
        setPreview(enrichedPreview);
      }
    } catch (err) {
      console.error('Enrichment failed:', err);
    } finally {
      setEnriching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Data</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-1">
            {igOnly 
              ? "Running in Instagram-only launch mode. Other platforms will appear here soon."
              : "Import contacts, brands, or deals from CSV or Google Sheets."
            }
          </p>
        </div>
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
          {/* Enrichment CTA Banner */}
          {importCompleted && kind === 'CONTACT' && (
            <div className="p-4 bg-[var(--tint-accent)] border border-[var(--brand-600)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--fg)]">Import completed!</h3>
                  <p className="text-sm text-[var(--muted-fg)]">Enhance your contact data with verified emails, LinkedIn profiles, and job titles.</p>
                </div>
                <Button 
                  onClick={enrichContacts} 
                  disabled={enriching}
                  className="bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]"
                >
                  {enriching ? 'Enriching...' : 'Enrich now'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-[var(--muted-fg)]">Preview of first few rows</div>
          <div className="overflow-auto border rounded">
            <table className="min-w-[600px] text-sm">
              <thead>
                <tr>
                  {headers.map(h=><th key={h} className="text-left p-2">{h}</th>)}
                  {enriched.length > 0 && (
                    <>
                      <th className="text-left p-2">LinkedIn</th>
                      <th className="text-left p-2">Source</th>
                      <th className="text-left p-2">Confidence</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0,10).map((r,i)=>(
                  <tr key={i} className="border-t">
                    {headers.map(h=><td key={h} className="p-2">{r[h]}</td>)}
                    {enriched.length > 0 && (
                      <>
                        <td className="p-2">
                          {r.linkedinUrl ? (
                            <a href={r.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-600)] hover:underline">
                              Profile
                            </a>
                          ) : '-'}
                        </td>
                        <td className="p-2">{r.enrichedSource || '-'}</td>
                        <td className="p-2">{r.confidence ? `${Math.round(r.confidence * 100)}%` : '-'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="progress" className="text-sm text-[var(--muted-fg)]">Processed: 0</div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>setStep(2)}>Back</Button>
            {!importCompleted ? (
              <Button onClick={runImport}>Run Import</Button>
            ) : enriched.length > 0 ? (
              <Button className="bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]">
                Update records
              </Button>
            ) : (
              <Button className="bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]">
                Save to CRM
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
