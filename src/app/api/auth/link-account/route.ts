// src/app/api/auth/link-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/link-account
 *
 * Links a portal user account to an existing customer record in the CRM.
 * This is used when a customer who previously booked via website/phone
 * later creates a portal account.
 *
 * Process:
 * 1. Get authenticated user
 * 2. Find customer by email/phone
 * 3. Link portal user ID to customer record
 * 4. Mark all previous jobs/invoices as linked
 * 5. Award welcome bonus points
 * 6. Send confirmation notification
 * 7. Create audit log
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user already linked to a customer
    const { data: existingLink } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email')
      .eq('portal_user_id', user.id)
      .single();

    if (existingLink) {
      return NextResponse.json({
        success: true,
        alreadyLinked: true,
        customer: {
          id: existingLink.id,
          name: `${existingLink.first_name} ${existingLink.last_name}`,
          email: existingLink.email,
        },
        message: 'Your account is already linked',
      });
    }

    // Find customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .is('portal_user_id', null)
      .single();

    if (customerError || !customer) {
      // Try finding by phone if email didn't work
      const phone = user.user_metadata?.phone;

      if (phone) {
        const { data: customerByPhone } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', phone)
          .is('portal_user_id', null)
          .single();

        if (!customerByPhone) {
          return NextResponse.json(
            {
              error: 'No customer record found matching your email or phone',
              success: false,
            },
            { status: 404 }
          );
        }

        // Use customer found by phone
        Object.assign(customer, customerByPhone);
      } else {
        return NextResponse.json(
          {
            error: 'No customer record found matching your email',
            success: false,
          },
          { status: 404 }
        );
      }
    }

    // Link portal user to customer
    const { error: linkError } = await supabase
      .from('customers')
      .update({
        portal_user_id: user.id,
        portal_account_created: true,
        portal_account_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id);

    if (linkError) {
      console.error('Failed to link account:', linkError);
      return NextResponse.json(
        { error: 'Failed to link account', success: false },
        { status: 500 }
      );
    }

    // Count and mark all unlinked jobs as linked
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, created_at, service_type, status')
      .eq('customer_id', customer.id)
      .is('linked_to_portal', null);

    const jobCount = jobs?.length || 0;

    if (jobCount > 0) {
      await supabase
        .from('jobs')
        .update({
          linked_to_portal: true,
          portal_linked_at: new Date().toISOString(),
        })
        .eq('customer_id', customer.id)
        .is('linked_to_portal', null);
    }

    // Count and mark all unlinked invoices as linked
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('customer_id', customer.id)
      .is('linked_to_portal', null);

    const invoiceCount = invoices?.length || 0;

    if (invoiceCount > 0) {
      await supabase
        .from('invoices')
        .update({
          linked_to_portal: true,
          portal_linked_at: new Date().toISOString(),
        })
        .eq('customer_id', customer.id)
        .is('linked_to_portal', null);
    }

    // Check if customer already has loyalty points
    const { data: existingLoyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_id', customer.id)
      .single();

    let welcomePoints = 0;

    if (!existingLoyalty) {
      // Create loyalty account with welcome bonus
      welcomePoints = 100;

      await supabase.from('loyalty_points').insert({
        customer_id: customer.id,
        points: welcomePoints,
        total_earned: welcomePoints,
        total_redeemed: 0,
        created_at: new Date().toISOString(),
      });

      await supabase.from('loyalty_transactions').insert({
        customer_id: customer.id,
        points: welcomePoints,
        transaction_type: 'signup_bonus',
        description: 'Welcome bonus for creating portal account',
        created_at: new Date().toISOString(),
      });
    } else {
      // Award portal linking bonus
      welcomePoints = 50;

      await supabase
        .from('loyalty_points')
        .update({
          points: existingLoyalty.points + welcomePoints,
          total_earned: existingLoyalty.total_earned + welcomePoints,
          updated_at: new Date().toISOString(),
        })
        .eq('customer_id', customer.id);

      await supabase.from('loyalty_transactions').insert({
        customer_id: customer.id,
        points: welcomePoints,
        transaction_type: 'bonus',
        description: 'Bonus for linking portal account to existing bookings',
        created_at: new Date().toISOString(),
      });
    }

    // Create portal activity log
    await supabase.from('portal_activity_logs').insert({
      customer_id: customer.id,
      activity_type: 'account_linked',
      description: `Portal account linked - found ${jobCount} previous booking(s)`,
      metadata: {
        user_id: user.id,
        jobs_linked: jobCount,
        invoices_linked: invoiceCount,
        welcome_points: welcomePoints,
      },
      created_at: new Date().toISOString(),
    });

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'account_linked',
      resource_type: 'customer',
      resource_id: customer.id,
      details: {
        email: user.email,
        linked_jobs: jobCount,
        linked_invoices: invoiceCount,
        welcome_points: welcomePoints,
      },
      status: 'success',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      alreadyLinked: false,
      customer: {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone,
        linkedJobs: jobCount,
        linkedInvoices: invoiceCount,
        welcomePoints: welcomePoints,
      },
      message: jobCount > 0
        ? `Welcome back! We found ${jobCount} previous booking(s) and added them to your account.`
        : 'Account linked successfully!',
    });

  } catch (error) {
    console.error('Account linking error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to link account',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/link-account
 *
 * Check if current user can link to an existing customer account
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if already linked
    const { data: existingLink } = await supabase
      .from('customers')
      .select('id')
      .eq('portal_user_id', user.id)
      .single();

    if (existingLink) {
      return NextResponse.json({
        canLink: false,
        alreadyLinked: true,
        customerId: existingLink.id,
      });
    }

    // Check if matching customer exists
    const { data: matchingCustomer } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .eq('email', user.email)
      .is('portal_user_id', null)
      .single();

    if (matchingCustomer) {
      // Get job count
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', matchingCustomer.id);

      return NextResponse.json({
        canLink: true,
        alreadyLinked: false,
        potentialMatch: {
          customerId: matchingCustomer.id,
          customerName: `${matchingCustomer.first_name} ${matchingCustomer.last_name}`,
          jobCount: jobCount || 0,
        },
      });
    }

    return NextResponse.json({
      canLink: false,
      alreadyLinked: false,
      message: 'No matching customer record found',
    });

  } catch (error) {
    console.error('Link check error:', error);
    return NextResponse.json(
      { error: 'Failed to check link status' },
      { status: 500 }
    );
  }
}
