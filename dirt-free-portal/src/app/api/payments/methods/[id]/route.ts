export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'

/**
 * Delete Payment Method
 *
 * Removes a saved payment method from a customer's Stripe account.
 *
 * Authentication: Required
 * Rate Limit: None
 *
 * Path Parameters:
 * - id: string - Stripe PaymentMethod ID
 *
 * Response (Success 200):
 * { success: true, message: "Payment method removed successfully" }
 *
 * Error Responses:
 * - 400: Payment method ID is required
 * - 500: Failed to remove payment method
 *
 * Example Usage:
 * DELETE /api/payments/methods/pm_xxx
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Detach the payment method from the customer
    await getStripe().paymentMethods.detach(id)

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    })
  } catch (error) {
    console.error('Error removing payment method:', error)
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    )
  }
}

/**
 * Set Default Payment Method
 *
 * Sets a payment method as the default for a customer.
 *
 * Authentication: Required
 * Rate Limit: None
 *
 * Path Parameters:
 * - id: string - Stripe PaymentMethod ID
 *
 * Request Body:
 * { customerId: string }  // Stripe customer ID
 *
 * Response (Success 200):
 * { success: true, message: "Default payment method updated successfully" }
 *
 * Error Responses:
 * - 400: Payment method ID is required
 * - 400: Customer ID is required
 * - 500: Failed to set default payment method
 *
 * Example Usage:
 * PATCH /api/payments/methods/pm_xxx
 * Body: { "customerId": "cus_xxx" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { customerId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Set the payment method as the default for the customer
    await getStripe().customers.update(customerId, {
      invoice_settings: {
        default_payment_method: id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated successfully',
    })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    )
  }
}
