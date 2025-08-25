import { ReactNode } from 'react'

export default function QuickAction({ children, icon, onClick }:{ 
  children:ReactNode; 
  icon?:ReactNode; 
  onClick?:()=>void 
}){
  return (
    <button onClick={onClick}>
      <div>
        {icon && <div>{icon}</div>}
        <div>{children}</div>
      </div>
    </button>
  )
}
