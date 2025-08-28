import React from 'react'
import { MPBase } from './MPBase'
import { ThemeTokens } from '@/src/services/mediaPack/types'
export function MPBold(props: React.ComponentProps<typeof MPBase> & any) {
  return (
    <MPBase {...props} title="Media Pack — Bold">
      <div style={{border:'4px solid var(--brand)', borderRadius:20, padding:20}}>
        {/* reuse Classic content shape; bold accents */}
        {props.children}
      </div>
    </MPBase>
  )
}
