'use client'

import { ReactNode } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export type ToolPageProps = {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}

export default function ToolPage({ 
  title, 
  description, 
  children, 
  actions 
}: ToolPageProps) {
  return (
    <Section title={title} description={description}>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
      
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {children}
      </div>
    </Section>
  );
}
