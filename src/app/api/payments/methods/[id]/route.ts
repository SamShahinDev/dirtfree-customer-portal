import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

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
    await stripe.paymentMethods.detach(id)

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
