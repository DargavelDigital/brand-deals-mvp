'use client'

import { useState } from 'react'
import { Card } from '@/ui/containers'
import Button from '@/components/ui/Button'

interface Contact {
  id: string
  name: string
  email: string
  company: string
  title: string
  status: 'active' | 'inactive'
  lastContact?: Date
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@nike.com',
    company: 'Nike',
    title: 'Marketing Director',
    status: 'active',
    lastContact: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@apple.com',
    company: 'Apple',
    title: 'Brand Partnerships Manager',
    status: 'active',
    lastContact: new Date('2024-01-10')
  }
]

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>(mockContacts)

  return (
    <div>
      <div>
        <h1>Contacts</h1>
        <p>
          Manage your brand contacts and communication history.
        </p>
      </div>

      <div>
        <div>
          <Card>
            <h2>Contact Lists</h2>
            <p>
              Organize contacts into lists for targeted outreach campaigns.
            </p>
            <div>
              <Button>
                Create New List
              </Button>
              <Button>
                Import Contacts
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2>Recent Contacts</h2>
            <p>
              Your most recently contacted brand representatives.
            </p>
            <div>
              {contacts.map((contact) => (
                <div key={contact.id}>
                  <div>
                    <h3>{contact.name}</h3>
                    <p>{contact.title} at {contact.company}</p>
                  </div>
                  <div>
                    <span>{contact.email}</span>
                    <span>{contact.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2>Import & Export</h2>
            <p>
              Bulk import contacts from CSV or export your contact database.
            </p>
            <div>
              <Button>
                Import CSV
              </Button>
              <Button>
                Export Contacts
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2>Contact Analytics</h2>
            <p>
              Track engagement and response rates across your contacts.
            </p>
            <div>
              <div>
                <div>Total Contacts</div>
                <div>{contacts.length}</div>
              </div>
              <div>
                <div>Active Contacts</div>
                <div>{contacts.filter(c => c.status === 'active').length}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
