'use client'
import * as React from 'react'
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react'

export type SequenceStep = {
  id: string
  name: string
  templateKey: string
  delay: number
  delayUnit: 'hours'|'days'
  subject: string
  variables: Record<string,string>
}
export type OutreachSequence = {
  name: string
  steps: SequenceStep[]
  settings: { pauseFirstSend:boolean; replyDetection:boolean; autoFollowUp:boolean }
}

export default function SequenceBuilder({
  value,onChange
}:{ value:OutreachSequence; onChange:(s:OutreachSequence)=>void }){
  const add = () => {
    const step:SequenceStep = {
      id: `step-${Date.now()}`,
      name: `Step ${value.steps.length+1}`,
      templateKey:'intro_v1',
      delay: value.steps.length?2:0,
      delayUnit:'days',
      subject:'',
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

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Sequence Builder</div>
        <button onClick={add} className="h-9 px-3 rounded-md bg-[var(--brand-600)] text-white flex items-center gap-2">
          <Plus className="w-4 h-4"/>Add Step
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
                <button disabled={idx===0} onClick={()=>move(s.id,'up')} className="h-9 w-9 rounded-md border border-[var(--border)]"><MoveUp className="w-4 h-4 m-auto"/></button>
                <button disabled={idx===value.steps.length-1} onClick={()=>move(s.id,'down')} className="h-9 w-9 rounded-md border border-[var(--border)]"><MoveDown className="w-4 h-4 m-auto"/></button>
                <button onClick={()=>remove(s.id)} className="h-9 w-9 rounded-md border border-[var(--border)]"><Trash2 className="w-4 h-4 m-auto"/></button>
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
