export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/log';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id
    
    // Mock data for testing
    const mockThreads = {
      'mock-thread-1': {
        id: 'mock-thread-1',
        subject: 'Partnership Opportunity',
        status: 'OPEN',
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastInboundAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        contact: {
          id: 'mock-contact-1',
          name: 'John Smith',
          email: 'john@acmecorp.com',
          company: 'Acme Corp'
        },
        messages: [
          {
            id: 'mock-message-1',
            role: 'inbound',
            fromEmail: 'john@acmecorp.com',
            toEmail: 'you@yourcompany.com',
            subject: 'Partnership Opportunity',
            text: 'Hi there! I came across your company and would love to discuss a potential partnership opportunity. Are you available for a call this week?',
            html: '<p>Hi there! I came across your company and would love to discuss a potential partnership opportunity. Are you available for a call this week?</p>',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      'mock-thread-2': {
        id: 'mock-thread-2',
        subject: 'Media Kit Request',
        status: 'WAITING',
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastInboundAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        contact: {
          id: 'mock-contact-2',
          name: 'Sarah Johnson',
          email: 'sarah@techstartup.com',
          company: 'Tech Startup Inc'
        },
        messages: [
          {
            id: 'mock-message-2',
            role: 'inbound',
            fromEmail: 'sarah@techstartup.com',
            toEmail: 'you@yourcompany.com',
            subject: 'Media Kit Request',
            text: 'Hi! I\'m interested in your services. Could you please send me your media kit and pricing information?',
            html: '<p>Hi! I\'m interested in your services. Could you please send me your media kit and pricing information?</p>',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      'mock-thread-3': {
        id: 'mock-thread-3',
        subject: 'Collaboration Inquiry',
        status: 'OPEN',
        lastMessageAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        lastInboundAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        contact: {
          id: 'mock-contact-3',
          name: 'Mike Chen',
          email: 'mike@innovateco.com',
          company: 'Innovate Co'
        },
        messages: [
          {
            id: 'mock-message-3',
            role: 'inbound',
            fromEmail: 'mike@innovateco.com',
            toEmail: 'you@yourcompany.com',
            subject: 'Collaboration Inquiry',
            text: 'Hello! I think we could create something amazing together. Would you be interested in exploring a collaboration?',
            html: '<p>Hello! I think we could create something amazing together. Would you be interested in exploring a collaboration?</p>',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    }

    const thread = mockThreads[threadId as keyof typeof mockThreads]
    
    if (!thread) {
      // Return mock data for testing if thread not found
      const mockThread = {
        id: threadId,
        subject: 'Mock Thread',
        status: 'OPEN',
        lastMessageAt: new Date().toISOString(),
        lastInboundAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        contact: {
          id: 'mock-contact',
          name: 'Mock Contact',
          email: 'mock@example.com',
          company: 'Mock Company'
        },
        messages: [
          {
            id: 'mock-message',
            role: 'inbound',
            fromEmail: 'mock@example.com',
            toEmail: 'you@yourcompany.com',
            subject: 'Mock Subject',
            text: 'This is a mock message for testing purposes.',
            html: '<p>This is a mock message for testing purposes.</p>',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
      
      return NextResponse.json({ ok: true, thread: mockThread })
    }
    
    return NextResponse.json({ ok: true, thread })
  } catch (error: any) {
    log.error('Failed to fetch thread:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}
