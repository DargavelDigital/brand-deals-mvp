export type ContactStatus = 'ACTIVE'|'INACTIVE'|'ARCHIVED'
export type ContactVerificationStatus = 'UNVERIFIED'|'VALID'|'RISKY'|'INVALID'

export interface ContactDTO {
  id: string
  workspaceId: string
  brandId?: string | null
  brandName?: string | null
  name: string
  title?: string | null
  email: string
  phone?: string | null
  company?: string | null
  seniority?: string | null
  verifiedStatus: ContactVerificationStatus
  score: number
  source?: string | null
  tags: string[]
  notes?: string | null
  lastContacted?: string | null // ISO
  status: ContactStatus
  createdAt: string
  updatedAt: string
}
