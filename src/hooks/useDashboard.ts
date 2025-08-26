'use client'
import useSWR from 'swr'

const fetcher = (url:string)=> fetch(url).then(r=>r.json())

export function useDashboard(){
  const { data, error, isLoading } = useSWR('/api/dashboard/summary', fetcher, { revalidateOnFocus:false })
  const summary = data?.data
  return { summary, error, isLoading }
}
