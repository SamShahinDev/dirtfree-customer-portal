/**
 * Payment Intent Creation Tests
 *
 * Tests for creating Stripe payment intents for invoices
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as createPaymentIntent } from '@/app/api/payments/create-intent/route'
import { mockPaymentIntent } from '../../fixtures/payments'
import {
  mockInvoice,
  mockPaidInvoice,
  mockCustomer,
} from '../../fixtures/invoices'
import {
  createMockSupabaseClient,
  createUnauthorizedSupabaseClient,
  createMockSupabaseClientNoInvoice,
} from '../../helpers/supabase-mocks'

// Mock modules
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/stripe/server')

describe('POST /api/payments/create-intent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a payment intent for a valid invoice', async () => {
    // Mock Supabase client
    const mockSupabase = createMockSupabaseClient({
      user: { id: 'user-123', email: 'test@example.com' },
      customer: mockCustomer,
      invoice: mockInvoice,
    })

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Mock Stripe payment intent creation
    const { stripe } = require('@/lib/stripe/server')
    stripe.paymentIntents = {
      create: jest.fn().mockResolvedValue(mockPaymentIntent),
    }

    // Create request
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: mockInvoice.id,
        amount: 250, // $250.00
      }),
    })

    // Call the API route
    const response = await createPaymentIntent(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.clientSecret).toBe(mockPaymentIntent.client_secret)
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 25000, // $250 * 100 = 25000 cents
      currency: 'usd',
      metadata: {
        invoiceId: mockInvoice.id,
        customerId: mockCustomer.id,
      },
      receipt_email: mockCustomer.email,
      description: `Invoice #${mockInvoice.id.slice(0, 8)} - Dirt Free Carpet`,
    })
  })

  it('should return 401 for unauthorized users', async () => {
    // Mock unauthorized Supabase client
    const mockSupabase = createUnauthorizedSupabaseClient()

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Create request
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: mockInvoice.id,
        amount: 250,
      }),
    })

    // Call the API route
    const response = await createPaymentIntent(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 for non-existent invoice', async () => {
    // Mock Supabase client with no invoice
    const mockSupabase = createMockSupabaseClientNoInvoice()

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Create request
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: 'non-existent-id',
        amount: 250,
      }),
    })

    // Call the API route
    const response = await createPaymentIntent(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(404)
    expect(data.error).toBe('Invoice not found')
  })

  it('should return 400 for already paid invoice', async () => {
    // Mock Supabase client with paid invoice
    const mockSupabase = createMockSupabaseClient({
      user: { id: 'user-123', email: 'test@example.com' },
      customer: mockCustomer,
      invoice: mockPaidInvoice,
    })

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Create request
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: mockPaidInvoice.id,
        amount: 250,
      }),
    })

    // Call the API route
    const response = await createPaymentIntent(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invoice already paid')
  })

  it('should handle Stripe errors gracefully', async () => {
    // Mock Supabase client
    const mockSupabase = createMockSupabaseClient({
      user: { id: 'user-123', email: 'test@example.com' },
      customer: mockCustomer,
      invoice: mockInvoice,
    })

    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue(mockSupabase)

    // Mock Stripe to throw error
    const { stripe } = require('@/lib/stripe/server')
    stripe.paymentIntents = {
      create: jest.fn().mockRejectedValue(new Error('Stripe API error')),
    }

    // Create request
    const request = new NextRequest('http://localhost:3000/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: mockInvoice.id,
        amount: 250,
      }),
    })

    // Call the API route
    const response = await createPaymentIntent(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(500)
    expect(data.error).toBe('Stripe API error')
  })
})
