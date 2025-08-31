// Ensure Node runtime (Prisma/Stripe cannot run on edge)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { withApiLogging } from '@/lib/api-wrapper'
import { env, flag } from '@/lib/env'

async function handler(req: Request | NextRequest) {
  try {
    // Get authenticated user context
    const auth = await requireAuth()
    
    // Check if billing is enabled
    if (!flag(env.FEATURE_BILLING_ENABLED) || !env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'BILLING_DISABLED',
        message: 'Billing is not enabled for this workspace',
        workspace: {
          id: auth.workspace.id,
          name: auth.workspace.name,
          plan: 'FREE'
        },
        limits: {
          aiTokensMonthly: 100000,
          emailsPerDay: 20,
          maxContacts: 500
        }
      }, { status: 200 })
    }

    // Billing is enabled, proceed with Stripe calls
    try {
      // Mock Stripe customer data for now
      // In production, this would make actual Stripe API calls
      const mockCustomer = {
        id: 'cus_mock123',
        email: auth.user.email,
        name: auth.user.name || 'Unknown',
        created: Date.now()
      }

      const mockSubscription = {
        id: 'sub_mock123',
        status: 'active',
        current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: {
          data: [{
            price: {
              id: 'price_mock123',
              unit_amount: 2900, // $29.00
              currency: 'usd',
              recurring: { interval: 'month' }
            }
          }]
        }
      }

      return NextResponse.json({
        ok: true,
        disabled: false,
        plan: 'PRO',
        customer: mockCustomer,
        subscription: mockSubscription,
        usage: {
          aiTokens: 0,
          emails: 0
        },
        limits: {
          aiTokensMonthly: 1000000,
          emailsPerDay: 1000,
          maxContacts: 10000
        }
      })

    } catch (stripeError) {
      // Stripe API call failed, return graceful error with defaults
      return NextResponse.json({
        ok: false,
        error: 'BILLING_SUMMARY_FAILED',
        message: 'Unable to fetch billing information',
        traceId: 'billing-error',
        workspace: {
          id: auth.workspace.id,
          name: auth.workspace.name,
          plan: 'FREE'
        },
        limits: {
          aiTokensMonthly: 100000,
          emailsPerDay: 20,
          maxContacts: 500
        }
      }, { status: 200 })
    }

  } catch (error) {
    // Auth error or other critical error
    if (error instanceof NextResponse) {
      return error
    }
    
    // Log the error and return a safe response
    console.error('Billing summary error:', error)
    return NextResponse.json({
      ok: false,
      error: 'BILLING_SUMMARY_FAILED',
      message: 'Unable to fetch billing information',
      traceId: 'billing-error',
      workspace: {
        id: 'unknown',
        name: 'Unknown',
        plan: 'FREE'
      },
      limits: {
        aiTokensMonthly: 100000,
        emailsPerDay: 20,
        maxContacts: 500
      }
    }, { status: 200 })
  }
}

export const GET = withApiLogging(handler)
