import { ReactNode } from 'react'

export default function MetricCard({ label, value, delta, icon }: { 
  label:ReactNode; 
  value:ReactNode; 
  delta?:ReactNode; 
  icon?:ReactNode 
}){
  return (
    <div>
      <div>
        <div>{label}</div>
        {icon && <div>{icon}</div>}
      </div>
      <div>{value}</div>
      {delta && <div>{delta}</div>}
    </div>
  )
}
