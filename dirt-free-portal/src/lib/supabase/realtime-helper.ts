import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

/**
 * Helper function to safely subscribe to Supabase realtime changes
 * Falls back to polling if WebSocket connection fails
 */
export function safeRealtimeSubscribe(
  supabase: SupabaseClient,
  table: string,
  filter: string | undefined,
  onData: (data: any) => void,
  onError?: (error: Error) => void
): { unsubscribe: () => void; channel: RealtimeChannel | null } {
  let channel: RealtimeChannel | null = null
  let pollInterval: NodeJS.Timeout | null = null

  try {
    // Try to subscribe to realtime changes
    channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter }),
        },
        (payload) => {
          try {
            onData(payload)
          } catch (err) {
            console.error(`Error processing realtime data for ${table}:`, err)
            if (onError) {
              onError(err instanceof Error ? err : new Error(String(err)))
            }
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn(`Realtime connection failed for ${table}, falling back to polling`)
          // If realtime fails, start polling
          startPolling()
        }
      })

    return {
      unsubscribe: () => {
        if (channel) {
          supabase.removeChannel(channel)
        }
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      },
      channel,
    }
  } catch (error) {
    console.error(`Failed to establish realtime subscription for ${table}:`, error)
    // Start polling as fallback
    startPolling()

    return {
      unsubscribe: () => {
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      },
      channel: null,
    }
  }

  function startPolling() {
    // Poll every 5 seconds as fallback to realtime
    pollInterval = setInterval(async () => {
      try {
        let query = supabase.from(table).select('*')
        if (filter) {
          // Simple filter parsing - in production you might want more sophisticated parsing
          query = query.eq(filter.split('=')[0], filter.split('=')[1])
        }
        const { data, error } = await query

        if (error) {
          console.error(`Error polling ${table}:`, error)
          if (onError) {
            onError(error)
          }
        } else if (data) {
          onData({ new: data })
        }
      } catch (err) {
        console.error(`Unexpected error during polling for ${table}:`, err)
        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)))
        }
      }
    }, 5000)
  }
}

/**
 * Detects if WebSocket connections are available
 * Returns false for some mobile browsers with strict security policies
 */
export function isWebSocketAvailable(): boolean {
  if (typeof window === 'undefined') return false

  try {
    // Check if WebSocket is available
    const isWSSupported = typeof WebSocket !== 'undefined'

    if (!isWSSupported) {
      console.warn('WebSocket not supported in this browser')
      return false
    }

    // Check for mobile Safari with restricted WebSocket
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOSSafari =
      userAgent.includes('iphone') ||
      userAgent.includes('ipad') ||
      (userAgent.includes('safari') && !userAgent.includes('chrome'))

    if (isIOSSafari) {
      console.log('iOS Safari detected - WebSocket may have restrictions')
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking WebSocket availability:', error)
    return false
  }
}
