'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { FileUpload, type UploadedFile } from '@/components/ui/file-upload'

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedCategory?: string | null
  onSuccess?: () => void
}

interface Appointment {
  id: string
  scheduled_date: string
  services: Array<{
    service: {
      name: string
    }
  }>
}

export function NewMessageDialog({
  open,
  onOpenChange,
  preselectedCategory,
  onSuccess,
}: NewMessageDialogProps) {
  const [category, setCategory] = useState(preselectedCategory || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [relatedAppointment, setRelatedAppointment] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({
    category: '',
    subject: '',
    message: '',
  })

  const supabase = createClient()

  // Helper functions
  const getCategoryTitle = (cat: string | null) => {
    const titles: Record<string, string> = {
      schedule: 'Schedule Change Request',
      service: 'Service Question',
      billing: 'Billing Inquiry',
      feedback: 'Send Feedback',
      general: 'General Message'
    }
    return cat ? titles[cat] || 'Send Message to Dirt Free Team' : 'Send Message to Dirt Free Team'
  }

  const getSubjectPlaceholder = (cat: string) => {
    const placeholders: Record<string, string> = {
      schedule: 'e.g., Need to reschedule my Tuesday appointment',
      service: 'e.g., Questions about carpet cleaning process',
      billing: 'e.g., Question about recent invoice',
      feedback: 'e.g., Great service from your team!',
      general: 'Brief description of your message'
    }
    return placeholders[cat] || 'Brief description of your message'
  }

  const getMessagePlaceholder = (cat: string) => {
    const placeholders: Record<string, string> = {
      schedule: 'Please let us know what date/time works better for you...',
      service: 'What would you like to know about our services?',
      billing: 'Please describe your billing question...',
      feedback: "We'd love to hear your thoughts...",
      general: 'Describe your question or concern in detail...'
    }
    return placeholders[cat] || 'Describe your question or concern in detail...'
  }

  // Load customer and appointments
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single()

      if (customer) {
        setCustomerId(customer.id)

        // Load upcoming appointments
        const { data: appointmentsData } = await supabase
          .from('jobs')
          .select('id, scheduled_date, services:job_services(service:services(name))')
          .eq('customer_id', customer.id)
          .in('status', ['scheduled', 'confirmed'])
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .order('scheduled_date', { ascending: true })
          .limit(10)

        setAppointments(appointmentsData || [])
      }
    }

    if (open) {
      loadData()
    }
  }, [open, supabase])

  // Update category when preselectedCategory changes
  useEffect(() => {
    if (preselectedCategory) {
      setCategory(preselectedCategory)
    }
  }, [preselectedCategory])

  const validateForm = () => {
    const newErrors = {
      category: '',
      subject: '',
      message: '',
    }

    if (!category) {
      newErrors.category = 'Please select a message category'
    }

    if (!subject || subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters'
    }

    if (!message || message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters'
    }

    setErrors(newErrors)
    return !newErrors.category && !newErrors.subject && !newErrors.message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    if (!customerId) {
      toast.error('Unable to send message. Please try again.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('messages').insert({
        customer_id: customerId,
        subject: subject.trim(),
        message: message.trim(),
        category: category,
        job_id: relatedAppointment || null,
        status: 'open',
        attachments: attachments,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Show success animation
      setShowSuccess(true)
      toast.success("Message sent successfully! We'll respond within 4 business hours.")

      // Close dialog after animation
      setTimeout(() => {
        setShowSuccess(false)

        // Reset form
        setCategory('')
        setSubject('')
        setMessage('')
        setRelatedAppointment('')
        setAttachments([])
        setErrors({ category: '', subject: '', message: '' })

        onOpenChange(false)

        if (onSuccess) {
          onSuccess()
        }
      }, 1500)
    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error object:', JSON.stringify(error, null, 2))

      // Check specific error types
      if (error?.code) {
        console.error('Supabase error code:', error.code)
      }
      if (error?.details) {
        console.error('Error details:', error.details)
      }

      toast.error(error?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            /* Success Animation */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Message Sent</DialogTitle>
              </DialogHeader>
              <div className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold mb-2"
                >
                  Message Sent Successfully!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground"
                >
                  We'll get back to you within 4 business hours
                </motion.p>
              </div>
            </motion.div>
          ) : (
            /* Form Content */
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>{getCategoryTitle(preselectedCategory || null)}</DialogTitle>
                <DialogDescription>
                  We'll respond within 4 business hours during business days
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="category">
                    Message Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    disabled={!!preselectedCategory}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : preselectedCategory ? 'bg-muted cursor-not-allowed' : ''}>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">Schedule Change</SelectItem>
                      <SelectItem value="service">Service Question</SelectItem>
                      <SelectItem value="billing">Billing Inquiry</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="general">General Message</SelectItem>
                    </SelectContent>
                  </Select>
                  {preselectedCategory && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Category pre-selected based on your choice
                    </p>
                  )}
                  {errors.category && !preselectedCategory && (
                    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Subject Line */}
                <div>
                  <Label htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={getSubjectPlaceholder(category)}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message Body */}
                <div>
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={getMessagePlaceholder(category)}
                    className={`min-h-[150px] resize-none ${errors.message ? 'border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <p className="text-xs text-red-500">{errors.message}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Be specific so we can help you better
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {message.length} / 20 min
                    </p>
                  </div>
                </div>

                {/* Photo Upload Option */}
                {customerId && (
                  <div>
                    <Label>Attach Photos (Optional)</Label>
                    <FileUpload
                      customerId={customerId}
                      bucket="MESSAGE_ATTACHMENTS"
                      category="messages"
                      maxFiles={5}
                      onFilesChange={setAttachments}
                      existingFiles={attachments}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Related Appointment - Show for schedule category or when no category selected */}
                {(category === 'schedule' || !category) && appointments.length > 0 && (
                  <div>
                    <Label htmlFor="appointment">
                      Related to an appointment?
                      {category === 'schedule' && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                      value={relatedAppointment}
                      onValueChange={setRelatedAppointment}
                      required={category === 'schedule'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={category === 'schedule' ? 'Select appointment to reschedule' : 'Select appointment (optional)'} />
                      </SelectTrigger>
                      <SelectContent>
                        {!category && <SelectItem value="none">No specific appointment</SelectItem>}
                        {appointments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {formatDate(apt.scheduled_date)} - {apt.services?.[0]?.service?.name || 'Service'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {category === 'schedule' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Select the appointment you'd like to reschedule
                      </p>
                    )}
                  </div>
                )}
              </form>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
