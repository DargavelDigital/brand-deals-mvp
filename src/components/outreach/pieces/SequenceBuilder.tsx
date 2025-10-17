'use client'
import * as React from 'react'
// Icons temporarily disabled due to Next.js 15.5.0 bundling issues
import { OutreachTone } from '@/types/outreach'
import { EMAIL_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/outreach/email-templates'

export type SequenceStep = {
  id: string
  name: string
  templateKey: string
  templateId?: string | null
  delay: number
  delayUnit: 'hours'|'days'
  subject: string
  body?: string
  variables: Record<string,string>
}
export type OutreachSequence = {
  name: string
  steps: SequenceStep[]
  settings: { pauseFirstSend:boolean; replyDetection:boolean; autoFollowUp:boolean; tone?: OutreachTone }
}

// Available variables for insertion
const AVAILABLE_VARIABLES = [
  { key: 'contactFirstName', description: 'Contact first name' },
  { key: 'contactLastName', description: 'Contact last name' },
  { key: 'contactEmail', description: 'Contact email' },
  { key: 'brandName', description: 'Brand name' },
  { key: 'brandWebsite', description: 'Brand website' },
  { key: 'creatorName', description: 'Your name' },
  { key: 'followerCount', description: 'Your follower count' },
  { key: 'engagementRate', description: 'Your engagement rate' },
  { key: 'niche', description: 'Your niche' },
  { key: 'mediaPackUrl', description: 'Media pack URL' },
  { key: 'topMarkets', description: 'Your top markets' },
  { key: 'ageRange', description: 'Audience age range' }
];

export default function SequenceBuilder({
  value,onChange
}:{ value:OutreachSequence; onChange:(s:OutreachSequence)=>void }){
  const [previewStepId, setPreviewStepId] = React.useState<string | null>(null)
  const [generatingStepId, setGeneratingStepId] = React.useState<string | null>(null)
  const textareaRefs = React.useRef<Record<string, HTMLTextAreaElement | null>>({})
  
  const add = () => {
    const step:SequenceStep = {
      id: `step-${Date.now()}`,
      name: `Step ${value.steps.length+1}`,
      templateKey:'intro_v1',
      templateId: null,
      delay: value.steps.length?2:0,
      delayUnit:'days',
      subject:'',
      body: '',
      variables:{}
    }
    onChange({...value, steps:[...value.steps, step]})
  }
  const update = (id:string, patch:Partial<SequenceStep>) =>
    onChange({...value, steps: value.steps.map(s=>s.id===id?{...s,...patch}:s)})
  const remove = (id:string) =>
    onChange({...value, steps: value.steps.filter(s=>s.id!==id)})
  const move = (id:string, dir:'up'|'down') => {
    const i=value.steps.findIndex(s=>s.id===id); if(i<0) return
    const j=dir==='up'?i-1:i+1; if(j<0 || j>=value.steps.length) return
    const arr=[...value.steps]; const [m]=arr.splice(i,1); arr.splice(j,0,m)
    onChange({...value, steps:arr})
  }

  // Insert variable at cursor position
  const insertVariable = (stepId: string, variableKey: string) => {
    const step = value.steps.find(s => s.id === stepId);
    if (!step) return;
    
    const textarea = textareaRefs.current[stepId];
    if (!textarea) {
      // Fallback: append to end
      update(stepId, { body: `${step.body || ''}{{${variableKey}}}` });
      return;
    }
    
    const cursorPos = textarea.selectionStart;
    const textBefore = (step.body || '').substring(0, cursorPos);
    const textAfter = (step.body || '').substring(cursorPos);
    
    update(stepId, { body: `${textBefore}{{${variableKey}}}${textAfter}` });
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variableKey.length + 4, cursorPos + variableKey.length + 4);
    }, 0);
  };

  // Generate email with AI
  const generateEmailWithAI = async (stepId: string) => {
    setGeneratingStepId(stepId);
    try {
      const stepIndex = value.steps.findIndex(s => s.id === stepId);
      const response = await fetch('/api/outreach/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: stepIndex + 1,
          tone: value.settings.tone || 'professional',
          totalSteps: value.steps.length
        })
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const { subject, body } = await response.json();
      update(stepId, { subject: subject || '', body: body || '' });
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate email. Please try again or write manually.');
    } finally {
      setGeneratingStepId(null);
    }
  };

  // Improve existing email with AI
  const improveEmailWithAI = async (stepId: string) => {
    const step = value.steps.find(s => s.id === stepId);
    if (!step?.body) {
      alert('Please write some email content first, then I can help improve it!');
      return;
    }
    
    setGeneratingStepId(stepId);
    try {
      const response = await fetch('/api/outreach/improve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBody: step.body,
          currentSubject: step.subject,
          tone: value.settings.tone || 'professional'
        })
      });
      
      if (!response.ok) throw new Error('Improvement failed');
      
      const { subject, body } = await response.json();
      update(stepId, { subject: subject || step.subject, body: body || step.body });
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Failed to improve email. Your original text has been preserved.');
    } finally {
      setGeneratingStepId(null);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Sequence Builder</div>
        <button onClick={add} className="h-9 px-3 rounded-md bg-[var(--brand-600)] text-white flex items-center gap-2">
          ➕ Add Step
        </button>
      </div>

      <div className="space-y-4">
        {value.steps.map((s,idx)=>(
          <div key={s.id} className="rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-fg)]">Step {idx+1}</span>
                <input className="h-9 w-40 rounded-md border border-[var(--border)] bg-[var(--card)] px-2"
                       value={s.name} onChange={e=>update(s.id,{name:e.target.value})}/>
              </div>
              <div className="flex gap-1">
                <button disabled={idx===0} onClick={()=>move(s.id,'up')} className="h-9 w-9 rounded-md border border-[var(--border)]">⬆️</button>
                <button disabled={idx===value.steps.length-1} onClick={()=>move(s.id,'down')} className="h-9 w-9 rounded-md border border-[var(--border)]">⬇️</button>
                <button onClick={()=>remove(s.id)} className="h-9 w-9 rounded-md border border-[var(--border)]">🗑️</button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm">Template</label>
                <select className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2"
                        value={s.templateKey} onChange={e=>update(s.id,{templateKey:e.target.value})}>
                  <option value="intro_v1">Introduction</option>
                  <option value="proof_v1">Proof points</option>
                  <option value="nudge_v1">Nudge</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Delay</label>
                <div className="mt-1 flex gap-2">
                  <input type="number" min="0" className="h-10 w-20 rounded-md border border-[var(--border)] bg-[var(--card)] px-2"
                         value={s.delay} onChange={e=>update(s.id,{delay: parseInt(e.target.value)||0})}/>
                  <select className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-2"
                          value={s.delayUnit} onChange={e=>update(s.id,{delayUnit:e.target.value as 'hours'|'days'})}>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm">Subject</label>
              <input className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
                     placeholder="Subject line…" value={s.subject} onChange={e=>update(s.id,{subject:e.target.value})}/>
            </div>

            {/* Email Body Editor Section */}
            <div className="mt-4 space-y-3">
              {/* Template Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Template
                </label>
                <select 
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                  value={s.templateId || 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      update(s.id, { templateId: null });
                    } else {
                      const template = EMAIL_TEMPLATES.find(t => t.id === e.target.value);
                      if (template) {
                        update(s.id, { 
                          templateId: template.id,
                          subject: template.subject,
                          body: template.body 
                        });
                      }
                    }
                  }}
                >
                  <option value="custom">✍️ Write Custom Email</option>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                      {EMAIL_TEMPLATES
                        .filter(t => t.category === cat.id)
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))
                      }
                    </optgroup>
                  ))}
                </select>
                
                {s.templateId && (
                  <p className="mt-1 text-xs text-[var(--muted-fg)]">
                    💡 {EMAIL_TEMPLATES.find(t => t.id === s.templateId)?.whenToUse}
                  </p>
                )}
              </div>

              {/* Email Body Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Email Body
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                      onClick={() => generateEmailWithAI(s.id)}
                      disabled={generatingStepId === s.id}
                    >
                      {generatingStepId === s.id ? '⏳ Generating...' : '✨ Generate with AI'}
                    </button>
                    {s.body && (
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                        onClick={() => improveEmailWithAI(s.id)}
                        disabled={generatingStepId === s.id}
                      >
                        {generatingStepId === s.id ? '⏳ Improving...' : '🚀 Improve with AI'}
                      </button>
                    )}
                  </div>
                </div>
                
                <textarea
                  ref={el => textareaRefs.current[s.id] = el}
                  className="w-full min-h-[250px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-mono text-sm"
                  placeholder="Write your email or select a template above..."
                  value={s.body || ''}
                  onChange={(e) => update(s.id, { body: e.target.value })}
                  data-step-id={s.id}
                />
                
                {/* Variable Insert Buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-[var(--muted-fg)]">Insert variables:</span>
                  {AVAILABLE_VARIABLES.map(v => (
                    <button
                      key={v.key}
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--fg)]"
                      onClick={() => insertVariable(s.id, v.key)}
                      title={v.description}
                    >
                      {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
                
                {/* Character Count */}
                {s.body && (
                  <div className="mt-1 text-xs text-[var(--muted-fg)] text-right">
                    {s.body.length} characters
                  </div>
                )}
              </div>

              {/* Preview Button */}
              {s.body && (
                <div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => setPreviewStepId(previewStepId === s.id ? null : s.id)}
                  >
                    {previewStepId === s.id ? '🔽 Hide Preview' : '👁️ Preview Email'}
                  </button>
                  
                  {previewStepId === s.id && (
                    <div className="mt-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                      <div className="text-sm font-medium mb-2">Preview:</div>
                      <div className="text-xs text-[var(--muted-fg)] mb-1">Subject: {s.subject || '(no subject)'}</div>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                        {s.body}
                      </div>
                      <div className="mt-3 text-xs text-[var(--muted-fg)]">
                        💡 Variables like {`{{contactFirstName}}`} will be replaced with actual values when sent
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {!value.steps.length && (
          <div className="border border-[var(--border)] rounded-lg py-10 text-center text-[var(--muted-fg)] bg-[var(--surface)]">
            No steps yet — click <b>Add Step</b> to begin
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
        <div className="text-base font-medium">Sequence Settings</div>
        
        {/* Tone Selector */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Tone</div>
          <div className="inline-flex rounded-lg border border-[var(--border)] p-1 bg-[var(--card)]">
            {(['professional', 'relaxed', 'fun'] as const).map((t) => {
              const currentTone: OutreachTone = value.settings?.tone ?? 'professional';
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ 
                    ...value, 
                    settings: { ...value.settings, tone: t } 
                  })}
                  className={[
                    "px-3 h-9 rounded-md text-sm transition",
                    currentTone === t 
                      ? "bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90 text-white shadow-sm" 
                      : "hover:bg-[var(--surface)] text-[var(--fg)]"
                  ].join(' ')}
                >
                  {t === 'professional' ? 'Professional' : t === 'relaxed' ? 'Relaxed' : 'Fun'}
                </button>
              );
            })}
          </div>
          <div className="text-[12px] text-[var(--muted-fg)]">
            The selected tone applies to all emails in this sequence.
          </div>
        </div>

        {([
          ['pauseFirstSend','Pause before sending first email'],
          ['replyDetection','Stop sequence when contact replies'],
          ['autoFollowUp','Automatically send follow-ups']
        ] as const).map(([k,label])=>(
          <label key={k} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" checked={value.settings[k as keyof typeof value.settings]}
                   onChange={e=>onChange({...value, settings:{...value.settings, [k]: e.target.checked}})} />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
