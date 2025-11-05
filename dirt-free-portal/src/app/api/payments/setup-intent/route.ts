export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { paymentLimiter } from '@/lib/rate-limit'

/**
 * Create Setup Intent
 *
 * Creates a Stripe setup intent for adding a payment method without making a payment.
 *
 * Authentication: Required
 * Rate Limit: 10 requests per minute per customer
 *
 * Request Body:
 * {
 *   customerId: string  // Stripe customer ID
 * }
 *
 * Response (Success 200):
 * {
 *   clientSecret: string  // Stripe SetupIntent client secret
 * }
 *
 * Error Responses:
 * - 400: Customer ID is required
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to create setup intent
 *
 * Example Usage:
 * POST /api/payments/setup-intent
 * Body: { "customerId": "cus_xxx" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Rate limiting - 10 setup intents per minute per customer
    try {
      await paymentLimiter.check(10, customerId)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Create a setup intent for adding a payment method
    const setupIntent = await getStripe().setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
