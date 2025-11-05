import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { SessionTracker } from '@/components/analytics/session-tracker'
import { getCachedCustomer, setCachedCustomer } from '@/lib/db-cache'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer data with caching
  // This query happens on EVERY page load, so caching provides massive performance improvement
  let customer = getCachedCustomer(user.email!)

  if (!customer) {
    // Cache miss - fetch from database
    const { data } = await supabase
      .from('customers')
      .select('id, name')
      .eq('email', user.email)
      .single()

    customer = data

    // Store in cache for next time (15 min TTL)
    if (data) {
      setCachedCustomer(user.email!, data)
    }
  }

  const customerName = customer?.name || user.email?.split('@')[0] || 'Customer'

  return (
    <>
      {customer?.id && <NotificationProvider customerId={customer.id} />}
      <SessionTracker />
      <div className="h-screen flex">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header customerName={customerName} customerId={customer?.id || ''} />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
