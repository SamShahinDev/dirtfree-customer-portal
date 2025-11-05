export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { paymentLimiter } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-utils'

/**
 * Create Payment Intent
 *
 * Creates a Stripe payment intent for an invoice.
 *
 * Authentication: Required (Supabase JWT)
 * Rate Limit: 10 requests per minute per customer
 *
 * Request Body:
 * {
 *   invoiceId: string,  // UUID of the invoice to pay
 *   amount: number      // Payment amount in dollars (e.g., 185.00)
 * }
 *
 * Response (Success 200):
 * {
 *   clientSecret: string  // Stripe PaymentIntent client secret
 * }
 *
 * Error Responses:
 * - 401: Unauthorized (user not authenticated)
 * - 404: Customer not found / Invoice not found
 * - 400: Invoice already paid
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to create payment intent
 *
 * Example Usage:
 * POST /api/payments/create-intent
 * Body: { "invoiceId": "uuid", "amount": 185.00 }
 */
export async function POST(request: Request) {
  // Declare variables outside try block for error handler access
  let invoiceId: string | undefined
  let amount: number | undefined

  try {
    const body = await request.json()
    invoiceId = body.invoiceId
    amount = body.amount

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify invoice belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Rate limiting - 10 payment intents per minute per customer
    try {
      await paymentLimiter.check(10, customer.id)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerId: customer.id,
      },
      receipt_email: customer.email,
      description: `Invoice #${invoice.id.slice(0, 8)} - Dirt Free Carpet`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    // Capture error in Sentry with context
    // Use saved values instead of re-parsing request body
    captureApiError(error, {
      section: 'payment-intent-creation',
      invoiceId,
      amount,
    })

    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
