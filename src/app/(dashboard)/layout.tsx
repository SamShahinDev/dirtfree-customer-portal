import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { NotificationProvider } from '@/components/notifications/notification-provider'

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

  // Fetch customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name')
    .eq('email', user.email)
    .single()

  const customerName = customer
    ? `${customer.first_name} ${customer.last_name}`
    : user.email?.split('@')[0] || 'Customer'

  return (
    <>
      {customer?.id && <NotificationProvider customerId={customer.id} />}
      <div className="h-screen flex">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header customerName={customerName} />
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
