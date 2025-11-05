// SSO Endpoint - Portal to Website
// Generates SSO token and redirects user to website with authentication

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSSOToken } from '@/lib/auth/sso-token';

// ============================================================================
// GET /api/auth/sso
// Initiates SSO flow from Portal to Website
// ============================================================================

/**
 * SSO Flow:
 * 1. User is authenticated in Portal
 * 2. User clicks "Visit Website" or similar link
 * 3. Portal generates SSO token
 * 4. Portal redirects to Website with token
 * 5. Website verifies token with Portal
 * 6. Website creates session for user
 *
 * Query Parameters:
 * - return_url: Full URL to redirect to after SSO (default: website home)
 * - return_path: Path on website to redirect to (alternative to return_url)
 *
 * Example:
 * /api/auth/sso?return_url=https://dirtfreecarpet.com/my-bookings
 * /api/auth/sso?return_path=/my-bookings
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    // ========================================================================
    // 1. Verify User Authentication
    // ========================================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // User not authenticated - redirect to login
      const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL);
      loginUrl.searchParams.set('redirect', req.url);

      return NextResponse.redirect(loginUrl.toString());
    }

    // ========================================================================
    // 2. Get Customer Record
    // ========================================================================

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email')
      .eq('portal_user_id', user.id)
      .single();

    if (customerError || !customer) {
      console.error('Customer not found for user:', user.id);
      return NextResponse.json(
        { error: 'Customer record not found' },
        { status: 404 }
      );
    }

    // ========================================================================
    // 3. Create SSO Token
    // ========================================================================

    const ssoToken = await createSSOToken(user.id, customer.id, {
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    // ========================================================================
    // 4. Determine Redirect URL
    // ========================================================================

    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get('return_url');
    const returnPath = searchParams.get('return_path');

    // Default to website home
    const websiteBaseUrl =
      process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://dirtfreecarpet.com';

    let targetUrl: URL;

    if (returnUrl) {
      // Use full return URL if provided
      targetUrl = new URL(returnUrl);
    } else if (returnPath) {
      // Use return path with website base
      targetUrl = new URL(returnPath, websiteBaseUrl);
    } else {
      // Default to website home with SSO callback
      targetUrl = new URL('/auth/sso-callback', websiteBaseUrl);
    }

    // Add SSO token to URL
    targetUrl.searchParams.set('token', ssoToken);

    // If returnPath was provided, preserve it
    if (returnPath) {
      targetUrl.searchParams.set('return_path', returnPath);
    }

    // ========================================================================
    // 5. Log SSO Activity
    // ========================================================================

    await supabase.from('portal_activity_logs').insert({
      customer_id: customer.id,
      activity_type: 'sso_initiated',
      description: 'SSO token created for website access',
      metadata: {
        user_id: user.id,
        target_url: targetUrl.toString(),
      },
      created_at: new Date().toISOString(),
    });

    // ========================================================================
    // 6. Redirect to Website
    // ========================================================================

    return NextResponse.redirect(targetUrl.toString());
  } catch (error) {
    console.error('SSO error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'SSO failed',
        success: false,
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
