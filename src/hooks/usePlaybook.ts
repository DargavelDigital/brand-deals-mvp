'use client'
import { useState } from 'react';

export function usePlaybook() {
  const [loading, setLoading] = useState(false);
  const [playbook, setPlaybook] = useState<any>(null);

  const load = async (seg:{industry?:string; sizeBand?:string; region?:string; season?:string}) => {
    setLoading(true);
    try {
      const r = await fetch('/api/netfx/playbook', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(seg) });
      const j = await r.json();
      if (j.ok) setPlaybook(j.playbook);
      return j.playbook;
    } finally { setLoading(false); }
  }

  return { loading, playbook, load };
}
