'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'appointment', label: 'Appointment Question' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'service', label: 'Service Quality' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
]

export default function NewMessagePage() {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user?.email)
        .single()

      const { error } = await supabase
        .from('messages')
        .insert({
          customer_id: customer.id,
          category,
          subject,
          message,
          status: 'open',
        })

      if (error) throw error

      // TODO: Send notification to staff

      toast.success('Message sent successfully!')
      router.push('/dashboard/messages')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="text-muted-foreground">
          Send a message to the Dirt Free team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your message"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need immediate help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            For urgent matters, please call us directly
          </p>
          <Button variant="outline" asChild>
            <a href="tel:7137302782">Call (713) 730-2782</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
