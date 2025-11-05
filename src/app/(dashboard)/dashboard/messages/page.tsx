import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Messages | Dirt Free Customer Portal',
  description: 'Communicate with the Dirt Free team',
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  const openCount = messages?.filter(m => m.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} open {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/dashboard/messages/${message.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{message.subject}</h3>
                            <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/messages/new">
                    Send Your First Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
