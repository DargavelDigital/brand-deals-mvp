'use client'

import clsx from 'clsx'

export default function StepperSkin({ steps, currentIndex }:{ 
  steps:{label:string}[]; 
  currentIndex:number 
}){
  return (
    <div>
      <ol>
        {steps.map((s, i)=>(
          <li key={i}>
            <div></div>
            <div>{s.label}</div>
            {i<steps.length-1 && <div></div>}
          </li>
        ))}
      </ol>
    </div>
  )
}
