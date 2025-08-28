import React from 'react'
import { MPBase } from './MPBase'
export function MPEditorial(props: any) {
  return (
    <MPBase {...props} title="Media Pack — Editorial">
      <div style={{maxWidth:860, margin:'0 auto'}}>{props.children}</div>
    </MPBase>
  )
}
