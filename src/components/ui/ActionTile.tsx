'use client'
import { useRouter } from 'next/navigation'

export default function ActionTile({ icon, label, href, onClick }:{
  icon: React.ReactNode; label: string; href?: string; onClick?: ()=>void
}){
  const router = useRouter()
  
  return (
    <button
      onClick={()=>{ onClick?.(); if(href) router.push(href) }}
      className="card w-full p-5 min-h-[112px] flex flex-col items-center justify-center hover:shadow-md transition-[box-shadow,background] cursor-pointer">
      <div className="size-9 rounded-full grid place-items-center bg-[var(--muted)] mb-2">{icon}</div>
      <div className="font-medium">{label}</div>
    </button>
  )
}
