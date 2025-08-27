'use client'
import * as React from 'react'
import type { OutreachSequence } from './pieces/SequenceBuilder'

type StartParams = {
  workspaceId: string
  brandId: string
  mediaPackId?: string
  contactIds: string[]
  sequence: OutreachSequence
  pauseFirstSend: boolean
}

export default function useOutreachSequence(){
  const [isStarting, setIsStarting] = React.useState(false)
  const [error, setError] = React.useState<string|null>(null)
  const [okToast, setOkToast] = React.useState<string|undefined>()

  const startSequence = async (params: StartParams) => {
    setIsStarting(true); setError(null); setOkToast(undefined)
    try{
      const res = await fetch('/api/outreach/start', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(params)
      })
      if(!res.ok){ throw new Error((await res.json()).error || 'Failed to start') }
      const data = await res.json()
      setOkToast(`Sequence started • ${data.enqueued} messages queued`)
      return data
    }catch(e: unknown){
      const errorMessage = e instanceof Error ? e.message : 'Failed to start'
      setError(errorMessage)
      throw e
    }finally{ setIsStarting(false) }
  }

  return { startSequence, isStarting, error, okToast }
}
