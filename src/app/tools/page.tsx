'use client'

import ToolPage from '@/components/tools/ToolPage'

export default function ToolsPage(){
  const items = [
    { href:'/tools/connect', label:'Connect Accounts' },
    { href:'/tools/audit', label:'Run AI Audit' },
    { href:'/tools/matches', label:'Generate Matches' },
    { href:'/tools/approve', label:'Approve Brands' },
    { href:'/tools/pack', label:'Build Media Pack' },
    { href:'/tools/contacts', label:'Discover Contacts' },
    { href:'/tools/outreach', label:'Start Outreach' },
  ]
  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Tools</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(i=>(
          <a key={i.href} href={i.href} className="card p-4 hover:shadow-md transition-shadow">{i.label}</a>
        ))}
      </div>
    </div>
  )
}
