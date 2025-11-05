export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'

/**
 * List Payment Methods
 *
 * Retrieves all saved payment methods for a customer from Stripe.
 *
 * Authentication: Required
 * Rate Limit: None
 *
 * Query Parameters:
 * - customerId: string (required) - Stripe customer ID
 *
 * Response (Success 200):
 * {
 *   paymentMethods: [
 *     {
 *       id: string,
 *       card: { brand, last4, exp_month, exp_year },
 *       is_default: boolean
 *     }
 *   ]
 * }
 *
 * Error Responses:
 * - 400: Customer ID is required
 * - 500: Failed to fetch payment methods
 *
 * Example Usage:
 * GET /api/payments/methods?customerId=cus_xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await getStripe().paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    // Get customer's default payment method
    const customer = await getStripe().customers.retrieve(customerId)
    const defaultPaymentMethodId =
      typeof customer !== 'deleted' ? customer.invoice_settings.default_payment_method : null

    // Map payment methods and mark the default one
    const formattedMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      card: {
        brand: method.card?.brand || '',
        last4: method.card?.last4 || '',
        exp_month: method.card?.exp_month || 0,
        exp_year: method.card?.exp_year || 0,
      },
      is_default: method.id === defaultPaymentMethodId,
    }))

    return NextResponse.json({
      paymentMethods: formattedMethods,
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
