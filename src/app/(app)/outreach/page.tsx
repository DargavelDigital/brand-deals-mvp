'use client'

import { useState } from 'react'
import { Col } from '@/ui/containers'
import Button from '@/components/ui/Button'

interface EmailTemplate {
  id: string
  name: string
  description: string
  variables: string[]
  lastUsed?: Date
}

interface Outreach {
  id: string
  brand: string
  template: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied'
  sentAt: Date
  response?: string
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Intro Email',
    description: 'Initial outreach to introduce yourself and your content',
    variables: ['{{creatorName}}', '{{brandName}}', '{{contentType}}'],
    lastUsed: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Follow-up Email',
    description: 'Gentle reminder after initial contact',
    variables: ['{{creatorName}}', '{{brandName}}', '{{previousEmail}}'],
    lastUsed: new Date('2024-01-10')
  }
]

const mockOutreach: Outreach[] = [
  {
    id: '1',
    brand: 'Nike',
    template: 'Intro Email',
    status: 'replied',
    sentAt: new Date('2024-01-15'),
    response: 'Thanks for reaching out! We\'d love to discuss a potential partnership.'
  },
  {
    id: '2',
    brand: 'Apple',
    template: 'Intro Email',
    status: 'opened',
    sentAt: new Date('2024-01-14')
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return ''
    case 'delivered': return ''
    case 'opened': return ''
    case 'clicked': return ''
    case 'replied': return ''
    default: return ''
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

export default function OutreachPage() {
  const [templates] = useState<EmailTemplate[]>(mockTemplates)
  const [outreach] = useState<Outreach[]>(mockOutreach)

  return (
    <div>
      <div>
        <h1>Outreach Management</h1>
        <p>Manage your email campaigns and templates</p>
      </div>

      <div>
        <Col>
          <div>
            <h2>Email Templates</h2>
            <div>
              {templates.map((template) => (
                <div key={template.id}>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <p>
                    Variables: {template.variables.join(', ')}
                  </p>
                  <div>
                    {template.variables.map((variable) => (
                      <span key={variable}>
                        {variable}
                      </span>
                    ))}
                  </div>
                  {template.lastUsed && (
                    <p>
                      Last used: {formatDate(template.lastUsed)}
                    </p>
                  )}
                  <div>
                    <Button>
                      Edit Template
                    </Button>
                    <Button>
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col>
          <div>
            <h2>Recent Outreach</h2>
            <div>
              {outreach.map((outreachItem) => (
                <div key={outreachItem.id}>
                  <div>
                    <span>{outreachItem.brand}</span>
                    <span>
                      {outreachItem.status}
                    </span>
                  </div>
                  <p>{outreachItem.template}</p>
                  <p>{formatDate(outreachItem.sentAt)}</p>
                  {outreachItem.response && (
                    <p>"{outreachItem.response}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </div>
    </div>
  )
}
