import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export default function QuickAction({ children, icon, onClick }:{ 
  children:ReactNode; 
  icon?:ReactNode; 
  onClick?:()=>void 
}){
  return (
    <Button variant="ghost" onClick={onClick} className="flex flex-col items-center gap-3 p-6 h-auto">
      <div className="flex flex-col items-center gap-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <div className="text-center">{children}</div>
      </div>
    </Button>
  )
}
