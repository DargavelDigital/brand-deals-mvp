'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface StepContactsProps {
  onContinue: (selectedContactIds: string[]) => void;
  onBack: () => void;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  brandName: string;
  verified: boolean;
}

export function StepContacts({ onContinue, onBack }: StepContactsProps) {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Marketing Director',
      email: 'sarah.johnson@nike.com',
      brandName: 'Nike',
      verified: true
    },
    {
      id: '2',
      name: 'Mike Chen',
      title: 'Brand Partnerships Manager',
      email: 'mike.chen@nike.com',
      brandName: 'Nike',
      verified: true
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      title: 'Creative Director',
      email: 'alex.rodriguez@apple.com',
      brandName: 'Apple',
      verified: true
    }
  ];

  const discoverContacts = async () => {
    setIsDiscovering(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasDiscovered(true);
    } catch (error) {
      console.error('Failed to discover contacts:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const canContinue = selectedContacts.length >= 1;

  return (
    <div>
      <div>
        <h1>Contacts</h1>
        <p>
          We'll discover verified contacts at your selected brands for outreach.
        </p>
      </div>

      <div>
        <h2>Contact Discovery</h2>
        
        {!hasDiscovered ? (
          <div>
            <div>
              <span>🔍</span>
            </div>
            <h3>Ready to find contacts?</h3>
            <p>
              We'll search for verified decision-makers at your selected brands.
            </p>
            <Button
              onClick={discoverContacts}
              disabled={isDiscovering}
            >
              {isDiscovering ? 'Discovering...' : 'Discover Contacts'}
            </Button>
          </div>
        ) : (
          <div>
            <div>
              <div>
                <span>✓</span>
                <span>Contacts discovered successfully!</span>
              </div>
              <p>
                We found {contacts.length} verified contacts at your selected brands.
              </p>
            </div>

            <div>
              <h3>Available Contacts</h3>
              <div>
                {contacts.map((contact) => (
                  <div key={contact.id}>
                    <input
                      type="checkbox"
                      id={contact.id}
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                    />
                    <div>
                      <div>
                        <h4>{contact.name}</h4>
                        {contact.verified && (
                          <span>
                            Verified
                          </span>
                        )}
                      </div>
                      <p>{contact.title}</p>
                      <p>{contact.email}</p>
                    </div>
                    <div>
                      <div>{contact.brandName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div>
                <div>
                  {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                </div>
                <div>
                  {canContinue ? 'Ready to continue' : 'Select at least 1 contact to continue'}
                </div>
              </div>
              <div>
                <Button
                  onClick={onBack}
                >
                  Back
                </Button>
                <Button
                  onClick={onContinue}
                  disabled={!canContinue}
                >
                  Use Top Contacts & Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
