// SSO Verification Endpoint
// Verifies SSO token and returns customer information

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySSOToken } from '@/lib/auth/sso-token';

// ============================================================================
// POST /api/auth/sso/verify
// Verifies an SSO token and returns customer information
// ============================================================================

/**
 * Verification Flow:
 * 1. Website receives SSO token from Portal redirect
 * 2. Website calls this endpoint to verify token
 * 3. Endpoint verifies JWT signature and expiration
 * 4. Endpoint fetches customer data from database
 * 5. Endpoint returns customer information to Website
 * 6. Website creates local session for user
 *
 * Request Body:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "userId": "uuid",
 *   "customerId": "uuid",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phone": "713-555-0100"
 * }
 *
 * Response (Error):
 * {
 *   "success": false,
 *   "error": "Invalid token"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // ========================================================================
    // 1. Get Token from Request
    // ========================================================================

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    // ========================================================================
    // 2. Verify Token
    // ========================================================================

    const payload = await verifySSOToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // ========================================================================
    // 3. Get Customer Details from Database
    // ========================================================================

    const supabase = createClient();

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, portal_user_id')
      .eq('id', payload.customerId)
      .single();

    if (customerError || !customer) {
      console.error('Customer not found:', payload.customerId);
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify customer is linked to the user in the token
    if (customer.portal_user_id !== payload.userId) {
      console.error('Customer/User mismatch:', {
        customerId: customer.id,
        expectedUserId: payload.userId,
        actualUserId: customer.portal_user_id,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid token - customer mismatch' },
        { status: 401 }
      );
    }

    // ========================================================================
    // 4. Get Loyalty Points (Optional)
    // ========================================================================

    const { data: loyaltyPoints } = await supabase
      .from('loyalty_points')
      .select('points, tier')
      .eq('customer_id', customer.id)
      .single();

    // ========================================================================
    // 5. Log Verification Activity
    // ========================================================================

    await supabase.from('portal_activity_logs').insert({
      customer_id: customer.id,
      activity_type: 'sso_verified',
      description: 'SSO token verified for website access',
      metadata: {
        user_id: payload.userId,
        token_issued_at: payload.iat,
        token_expires_at: payload.exp,
      },
      created_at: new Date().toISOString(),
    });

    // ========================================================================
    // 6. Return Customer Information
    // ========================================================================

    return NextResponse.json({
      success: true,
      userId: payload.userId,
      customerId: payload.customerId,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      loyaltyPoints: loyaltyPoints?.points || 0,
      loyaltyTier: loyaltyPoints?.tier || 'bronze',
    });
  } catch (error) {
    console.error('SSO verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS handler for CORS
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
