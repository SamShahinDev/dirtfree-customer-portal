import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user.email)
    .single()

  if (!customer) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with your appointments, messages, and more
        </p>
      </div>

      <NotificationCenter customerId={customer.id} />
    </div>
  )
}
