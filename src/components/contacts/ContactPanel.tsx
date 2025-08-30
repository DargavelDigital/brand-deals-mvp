'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export function ContactPanel({ contactId }: { contactId: string }) {
  const [notes, setNotes] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [note, setNote] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [due, setDue] = useState<string>('')

  async function load() {
    const [n, t] = await Promise.all([
      fetch(`/api/contacts/${contactId}/notes`).then(r=>r.json()),
      fetch(`/api/contacts/${contactId}/tasks`).then(r=>r.json())
    ])
    setNotes(n.items ?? [])
    setTasks(t.items ?? [])
  }

  useEffect(()=>{ load() },[contactId])

  async function addNote() {
    if (!note.trim()) return
    await fetch(`/api/contacts/${contactId}/notes`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ body: note })})
    setNote('')
    load()
  }

  async function addTask() {
    if (!taskTitle.trim()) return
    await fetch(`/api/contacts/${contactId}/tasks`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: taskTitle, dueAt: due || null })})
    setTaskTitle(''); setDue('')
    load()
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Notes</div>
        <div className="space-y-2 max-h-48 overflow-auto mb-3">
          {notes.map(n=>(
            <div key={n.id} className="text-sm border-b border-[var(--border)] pb-2">
              {n.body}
              <div className="text-[11px] text-[var(--muted-fg)]">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {notes.length===0 && <div className="text-sm text-[var(--muted-fg)]">No notes yet.</div>}
        </div>
        <Textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note…" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={addNote}>Add note</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Next step</div>
        <div className="flex gap-2 items-center mb-2">
          <Input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="e.g. Send proposal" />
          <Input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} className="w-44" />
          <Button onClick={addTask}>Add</Button>
        </div>
        <div className="space-y-2 max-h-40 overflow-auto">
          {tasks.map(t=>(
            <div key={t.id} className="text-sm flex items-center justify-between border-b border-[var(--border)] pb-1">
              <div>
                <div>{t.title}</div>
                <div className="text-[11px] text-[var(--muted-fg)]">{t.dueAt ? new Date(t.dueAt).toLocaleString() : 'No due date'}</div>
              </div>
              <form method="post" onSubmit={async (e)=>{e.preventDefault();
                await fetch(`/api/contacts/${contactId}/tasks`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: t.id, status: t.status==='OPEN'?'DONE':'OPEN' }) })
                load()
              }}>
                <Button size="sm" variant="secondary">{t.status==='OPEN' ? 'Mark done' : 'Reopen'}</Button>
              </form>
            </div>
          ))}
          {tasks.length===0 && <div className="text-sm text-[var(--muted-fg)]">No tasks yet.</div>}
        </div>
      </Card>
    </div>
  )
}
