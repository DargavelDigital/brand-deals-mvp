'use client'
import useSWR from 'swr'

const fetcher = (u:string)=> fetch(u, { cache:'no-store' }).then(r=>r.json())

export type BrandRunStatus = 'idle' | 'connecting' | 'audit' | 'matches' | 'approve' | 'pack' | 'contacts' | 'outreach' | 'done' | string

export function useBrandRun(){
  const { data, error, isLoading, mutate } = useSWR('/api/brand-run/current', fetcher, { revalidateOnFocus:false })
  // expected shape: { ok:true, data:{ status: 'idle' | ... } } — tolerate variations
  const status: BrandRunStatus = data?.data?.status ?? data?.status ?? 'idle'
  return { status, isLoading, error, refresh: mutate }
}
