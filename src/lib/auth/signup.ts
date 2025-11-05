// src/lib/auth/signup.ts
/**
 * Sign Up with Automatic Account Linking
 *
 * When a customer creates a portal account, automatically check if they
 * already exist in the CRM (from website bookings, phone bookings, etc.)
 * and link their account to see complete booking history.
 */

import { createClient } from '@/lib/supabase/server';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignUpResult {
  success: boolean;
  userId?: string;
  customerId?: string;
  accountLinked: boolean;
  existingJobs?: number;
  existingInvoices?: number;
  welcomePoints?: number;
  error?: string;
  message: string;
}

/**
 * Sign up a new user and automatically link to existing customer if found
 */
export async function signUpWithLinking(data: SignUpData): Promise<SignUpResult> {
  const supabase = createClient();

  try {
    const { email, password, firstName, lastName, phone } = data;

    // Check if customer exists in CRM (by email or phone)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${email}${phone ? `,phone.eq.${phone}` : ''}`)
      .is('portal_user_id', null)
      .single();

    if (existingCustomer) {
      // Customer exists in CRM - create auth and link
      console.log('Existing customer found, linking account...');

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            customer_id: existingCustomer.id,
            first_name: existingCustomer.first_name,
            last_name: existingCustomer.last_name,
            phone: existingCustomer.phone,
          },
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return {
          success: false,
          accountLinked: false,
          error: signUpError.message,
          message: 'Failed to create account',
        };
      }

      if (!authData.user) {
        return {
          success: false,
          accountLinked: false,
          error: 'No user returned from signup',
          message: 'Failed to create account',
        };
      }

      // Link account automatically
      const { error: linkError } = await supabase
        .from('customers')
        .update({
          portal_user_id: authData.user.id,
          portal_account_created: true,
          portal_account_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCustomer.id);

      if (linkError) {
        console.error('Account linking error:', linkError);
        // Don't fail the signup, just log it
      }

      // Count existing jobs
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', existingCustomer.id);

      // Count existing invoices
      const { count: invoiceCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', existingCustomer.id);

      // Mark jobs as linked
      if (jobCount && jobCount > 0) {
        await supabase
          .from('jobs')
          .update({
            linked_to_portal: true,
            portal_linked_at: new Date().toISOString(),
          })
          .eq('customer_id', existingCustomer.id);
      }

      // Mark invoices as linked
      if (invoiceCount && invoiceCount > 0) {
        await supabase
          .from('invoices')
          .update({
            linked_to_portal: true,
            portal_linked_at: new Date().toISOString(),
          })
          .eq('customer_id', existingCustomer.id);
      }

      // Award linking bonus points
      const welcomePoints = 50;
      await supabase.from('loyalty_transactions').insert({
        customer_id: existingCustomer.id,
        points: welcomePoints,
        transaction_type: 'bonus',
        description: 'Portal account created - previous customer welcome back bonus',
        created_at: new Date().toISOString(),
      });

      // Create activity log
      await supabase.from('portal_activity_logs').insert({
        customer_id: existingCustomer.id,
        activity_type: 'account_created_and_linked',
        description: `Portal account created and linked to ${jobCount || 0} previous booking(s)`,
        metadata: {
          user_id: authData.user.id,
          jobs_found: jobCount || 0,
          invoices_found: invoiceCount || 0,
        },
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        userId: authData.user.id,
        customerId: existingCustomer.id,
        accountLinked: true,
        existingJobs: jobCount || 0,
        existingInvoices: invoiceCount || 0,
        welcomePoints: welcomePoints,
        message: `Welcome back! We found ${jobCount || 0} previous booking(s) and added them to your account. You earned ${welcomePoints} bonus points!`,
      };

    } else {
      // New customer - create both auth and customer record
      console.log('New customer, creating fresh account...');

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || '',
          },
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return {
          success: false,
          accountLinked: false,
          error: signUpError.message,
          message: 'Failed to create account',
        };
      }

      if (!authData.user) {
        return {
          success: false,
          accountLinked: false,
          error: 'No user returned from signup',
          message: 'Failed to create account',
        };
      }

      // Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          portal_user_id: authData.user.id,
          portal_account_created: true,
          portal_account_created_at: new Date().toISOString(),
          source: 'portal_signup',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (customerError) {
        console.error('Customer creation error:', customerError);
        // Auth account was created but customer record failed
        // User can still log in, and customer record can be created on next login
      }

      const customerId = newCustomer?.id;

      // Create loyalty account with welcome bonus
      const welcomePoints = 100;

      if (customerId) {
        await supabase.from('loyalty_points').insert({
          customer_id: customerId,
          points: welcomePoints,
          total_earned: welcomePoints,
          total_redeemed: 0,
          created_at: new Date().toISOString(),
        });

        await supabase.from('loyalty_transactions').insert({
          customer_id: customerId,
          points: welcomePoints,
          transaction_type: 'signup_bonus',
          description: 'Welcome bonus for new customer signup',
          created_at: new Date().toISOString(),
        });

        // Create activity log
        await supabase.from('portal_activity_logs').insert({
          customer_id: customerId,
          activity_type: 'account_created',
          description: 'New portal account created',
          metadata: {
            user_id: authData.user.id,
            welcome_points: welcomePoints,
          },
          created_at: new Date().toISOString(),
        });
      }

      return {
        success: true,
        userId: authData.user.id,
        customerId: customerId,
        accountLinked: false,
        welcomePoints: welcomePoints,
        message: `Account created! You earned ${welcomePoints} welcome bonus points.`,
      };
    }

  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      accountLinked: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create account. Please try again.',
    };
  }
}

/**
 * Check if a user can link to an existing customer account
 */
export async function checkLinkingEligibility(email: string): Promise<{
  canLink: boolean;
  customerName?: string;
  jobCount?: number;
}> {
  const supabase = createClient();

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .eq('email', email)
      .is('portal_user_id', null)
      .single();

    if (!customer) {
      return { canLink: false };
    }

    // Count jobs
    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id);

    return {
      canLink: true,
      customerName: `${customer.first_name} ${customer.last_name}`,
      jobCount: jobCount || 0,
    };

  } catch (error) {
    console.error('Eligibility check error:', error);
    return { canLink: false };
  }
}
