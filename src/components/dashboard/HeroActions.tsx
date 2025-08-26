'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBrandRun } from '@/hooks/useBrandRun'
import { Button } from '@/components/ui/Button'

export function HeroActions(){
  console.log('HeroActions component rendering')
  const router = useRouter()
  const { status, isLoading: loadingStatus } = useBrandRun()
  const [busy, setBusy] = useState(false)

  console.log('HeroActions - status:', status, 'loadingStatus:', loadingStatus)

  const onStart = async ()=>{
    console.log('onStart clicked')
    try{
      setBusy(true)
      const r = await fetch('/api/brand-run/start', { method:'POST' })
      const j = await r.json().catch(()=> ({}))
      if (j?.ok && j?.redirect){ router.push(j.redirect); return }
      // fallback: go to the workflow regardless
      router.push('/brand-run')
    }catch(e){
      // optionally toast; stay quiet to avoid copy changes
      router.push('/brand-run')
    }finally{ setBusy(false) }
  }

  const onConfigure = ()=> {
    console.log('onConfigure clicked')
    router.push('/settings')
  }

  const label = (status && status !== 'idle') ? 'Continue' : 'Start'
  console.log('HeroActions - label:', label)

  return (
    <>
      <Button onClick={onStart} disabled={busy || loadingStatus}>
        {label}
      </Button>
      <Button variant="secondary" onClick={onConfigure}>
        Configure
      </Button>
    </>
  )
}
