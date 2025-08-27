export type OutreachTone = 'professional' | 'relaxed' | 'fun'

export interface OutreachSequenceSettings {
  pauseFirstSend?: boolean
  replyDetection?: boolean
  autoFollowUp?: boolean
  tone?: OutreachTone
}

export interface OutreachSequence {
  name: string
  steps: any[]
  settings: OutreachSequenceSettings
}
