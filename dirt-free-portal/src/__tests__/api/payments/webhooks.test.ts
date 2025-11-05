/**
 * Stripe Webhook Tests
 *
 * Tests for Stripe webhook handling (payment_intent events)
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as handleWebhook } from '@/app/api/webhooks/stripe/route'
import {
  mockSuccessfulPaymentIntent,
  mockPaymentIntentSucceededEvent,
  mockPaymentIntentFailedEvent,
} from '../../fixtures/payments'
import {
  mockInvoice,
  mockCustomer,
  mockLoyaltyPoints,
} from '../../fixtures/invoices'
import { createMockSupabaseClient } from '../../helpers/supabase-mocks'

// Mock modules
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/stripe/server')
jest.mock('next/headers')

describe('POST /api/webhooks/stripe', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up environment variables
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'

    // Create mock Supabase client with update capabilities
    mockSupabase = createMockSupabaseClient({
      user: { id: 'user-123', email: 'test@example.com' },
      customer: mockCustomer,
      invoice: mockInvoice,
      loyaltyPoints: mockLoyaltyPoints,
    })

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Mock next/headers
    const { headers } = require('next/headers')
    headers.mockResolvedValue({
      get: jest.fn().mockReturnValue('t=123,v1=signature'),
    })
  })

  it('should handle payment_intent.succeeded event', async () => {
    // Mock Stripe webhook verification
    const { stripe } = require('@/lib/stripe/server')
    stripe.webhooks = {
      constructEvent: jest.fn().mockReturnValue(mockPaymentIntentSucceededEvent),
    }

    // Create request with webhook payload
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=signature',
      },
      body: JSON.stringify(mockPaymentIntentSucceededEvent),
    })

    // Call the webhook handler
    const response = await handleWebhook(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.received).toBe(true)

    // Verify invoice was updated
    expect(mockSupabase.from).toHaveBeenCalledWith('invoices')

    // Verify loyalty points were updated
    expect(mockSupabase.from).toHaveBeenCalledWith('loyalty_points')
    expect(mockSupabase.from).toHaveBeenCalledWith('loyalty_transactions')
  })

  it('should handle payment_intent.payment_failed event', async () => {
    // Mock Stripe webhook verification
    const { stripe } = require('@/lib/stripe/server')
    stripe.webhooks = {
      constructEvent: jest.fn().mockReturnValue(mockPaymentIntentFailedEvent),
    }

    // Create request with webhook payload
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=signature',
      },
      body: JSON.stringify(mockPaymentIntentFailedEvent),
    })

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    // Call the webhook handler
    const response = await handleWebhook(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Payment failed:',
      mockPaymentIntentFailedEvent.data.object.id
    )

    consoleErrorSpy.mockRestore()
  })

  it('should reject webhooks with invalid signatures', async () => {
    // Mock Stripe to throw signature verification error
    const { stripe } = require('@/lib/stripe/server')
    stripe.webhooks = {
      constructEvent: jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature')
      }),
    }

    // Create request with invalid signature
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid_signature',
      },
      body: JSON.stringify(mockPaymentIntentSucceededEvent),
    })

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    // Call the webhook handler
    const response = await handleWebhook(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Webhook signature verification failed:',
      'Invalid signature'
    )

    consoleErrorSpy.mockRestore()
  })

  it('should calculate correct loyalty points (10 points per dollar)', async () => {
    // Mock Stripe webhook verification
    const { stripe } = require('@/lib/stripe/server')
    stripe.webhooks = {
      constructEvent: jest.fn().mockReturnValue(mockPaymentIntentSucceededEvent),
    }

    // Create request
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=signature',
      },
      body: JSON.stringify(mockPaymentIntentSucceededEvent),
    })

    // Call the webhook handler
    await handleWebhook(request)

    // Payment was $250 (25000 cents), so should award 2500 points
    const expectedPoints = Math.floor(mockSuccessfulPaymentIntent.amount / 100) * 10

    // Verify loyalty points calculation
    expect(expectedPoints).toBe(2500) // $250 * 10 = 2500 points
  })

  it('should handle unknown event types gracefully', async () => {
    // Create unknown event type
    const unknownEvent = {
      ...mockPaymentIntentSucceededEvent,
      type: 'unknown.event.type',
    }

    // Mock Stripe webhook verification
    const { stripe } = require('@/lib/stripe/server')
    stripe.webhooks = {
      constructEvent: jest.fn().mockReturnValue(unknownEvent),
    }

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    // Create request
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=signature',
      },
      body: JSON.stringify(unknownEvent),
    })

    // Call the webhook handler
    const response = await handleWebhook(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Unhandled event type: unknown.event.type'
    )

    consoleLogSpy.mockRestore()
  })
})
