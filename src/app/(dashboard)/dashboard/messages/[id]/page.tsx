import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, User } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ReplyForm } from '@/components/messages/reply-form'

export const metadata = {
  title: 'Message Thread | Dirt Free Customer Portal',
  description: 'View and reply to your message conversation',
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

interface Props {
  params: { id: string }
}

export default async function MessageThreadPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name')
    .eq('email', user?.email)
    .single()

  const { data: message } = await supabase
    .from('messages')
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', customer?.id)
    .single()

  if (!message) {
    notFound()
  }

  // Get message replies
  const { data: replies } = await supabase
    .from('message_replies')
    .select('*, staff:staff_users(first_name, last_name)')
    .eq('message_id', message.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{message.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Category: {message.category} • {formatDate(message.created_at)}
          </p>
        </div>
        <Badge className={statusColors[message.status as keyof typeof statusColors]}>
          {message.status}
        </Badge>
      </div>

      {/* Original Message */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(message.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{message.message}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold">Conversation</h2>
          {replies.map((reply) => (
            <Card key={reply.id} className={reply.is_staff_reply ? 'bg-blue-50' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${reply.is_staff_reply ? 'bg-blue-100' : 'bg-primary/10'}`}>
                    {reply.is_staff_reply ? (
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {reply.is_staff_reply
                        ? `${reply.staff?.first_name} ${reply.staff?.last_name} (Dirt Free Team)`
                        : `${customer.first_name} ${customer.last_name}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(reply.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {message.status !== 'closed' && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Add a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <ReplyForm messageId={message.id} customerId={customer.id} />
            </CardContent>
          </Card>
        </>
      )}

      {message.status === 'closed' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              This conversation has been closed. If you need further assistance,
              please create a new message.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
