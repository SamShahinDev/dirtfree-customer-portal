import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Track a customer portal login session
 * Call this after successful authentication
 */
export async function trackPortalLogin(
  customerId: string,
  supabaseClient: SupabaseClient,
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<{ success: boolean; sessionId?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('portal_sessions')
      .insert({
        customer_id: customerId,
        login_at: new Date().toISOString(),
        ip_address: metadata?.ipAddress || null,
        user_agent: metadata?.userAgent || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to track portal login:', error)
      return { success: false }
    }

    return {
      success: true,
      sessionId: data?.id,
    }
  } catch (error) {
    console.error('Session tracking error:', error)
    return { success: false }
  }
}

/**
 * Track a customer portal logout
 * Call this when user logs out
 */
export async function trackPortalLogout(
  sessionId: string,
  supabaseClient: SupabaseClient
): Promise<{ success: boolean }> {
  try {
    const logoutTime = new Date()

    // Get the session to calculate duration
    const { data: session } = await supabaseClient
      .from('portal_sessions')
      .select('login_at')
      .eq('id', sessionId)
      .single()

    let sessionDuration: number | null = null
    if (session?.login_at) {
      const loginTime = new Date(session.login_at)
      sessionDuration = Math.floor((logoutTime.getTime() - loginTime.getTime()) / 60000) // minutes
    }

    const { error } = await supabaseClient
      .from('portal_sessions')
      .update({
        logout_at: logoutTime.toISOString(),
        session_duration: sessionDuration,
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to track portal logout:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('Logout tracking error:', error)
    return { success: false }
  }
}

/**
 * Get current user session for tracking
 * Useful for tracking logout
 */
export async function getCurrentSession(
  customerId: string,
  supabaseClient: SupabaseClient
): Promise<{ sessionId?: string }> {
  try {
    // Get the most recent session without a logout time
    const { data } = await supabaseClient
      .from('portal_sessions')
      .select('id')
      .eq('customer_id', customerId)
      .is('logout_at', null)
      .order('login_at', { ascending: false })
      .limit(1)
      .single()

    return { sessionId: data?.id }
  } catch (error) {
    return {}
  }
}
