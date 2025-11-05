export const emailTemplates = {
  appointmentConfirmation: (data: {
    customerName: string
    serviceDate: string
    serviceTime: string
    services: string[]
    address: string
  }) => ({
    subject: 'Appointment Confirmed - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>Appointment Confirmed!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${data.serviceDate}</p>
            <p><strong>Time:</strong> ${data.serviceTime}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
            <p><strong>Location:</strong> ${data.address}</p>
          </div>

          <p>We'll send you a reminder 24 hours before your appointment.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Need to reschedule? <a href="https://portal.dirtfreecarpet.com/dashboard/appointments">Manage your appointment</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (data: {
    customerName: string
    invoiceNumber: string
    amount: number
    paymentDate: string
    services: string[]
  }) => ({
    subject: 'Payment Receipt - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1>Payment Received</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>Thank you for your payment. Your receipt is below:</p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
          </div>

          <p>A copy of your invoice has been saved to your account.</p>

          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/invoices"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Invoice
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  loyaltyPointsEarned: (data: {
    customerName: string
    pointsEarned: number
    totalPoints: number
    rewardValue: number
  }) => ({
    subject: 'You Earned Loyalty Points! - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Points Earned!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>You've earned loyalty points for your recent service!</p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 36px; font-weight: bold; color: #7c3aed; margin: 0;">
              +${data.pointsEarned}
            </p>
            <p style="font-size: 14px; color: #6b7280;">Points Earned</p>
            <p style="margin-top: 15px;">
              <strong>New Balance:</strong> ${data.totalPoints} points ($${data.rewardValue.toFixed(2)} in rewards)
            </p>
          </div>

          <p>Redeem your points for discounts, free services, and more!</p>

          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/rewards"
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Rewards
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  appointmentReminder: (data: {
    customerName: string
    serviceDate: string
    serviceTime: string
    services: string[]
    address: string
    hoursUntil: number
  }) => ({
    subject: 'Appointment Reminder - Tomorrow - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1>⏰ Appointment Reminder</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>This is a friendly reminder that your carpet cleaning appointment is coming up ${data.hoursUntil === 24 ? 'tomorrow' : `in ${data.hoursUntil} hours`}!</p>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Date:</strong> ${data.serviceDate}</p>
            <p><strong>Time:</strong> ${data.serviceTime}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
            <p><strong>Location:</strong> ${data.address}</p>
          </div>

          <p><strong>Please prepare for our arrival:</strong></p>
          <ul style="line-height: 1.8;">
            <li>Remove small items and valuables from carpeted areas</li>
            <li>Vacuum high-traffic areas if possible</li>
            <li>Ensure pets are secured</li>
            <li>Clear access to all areas to be cleaned</li>
          </ul>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Need to reschedule? <a href="https://portal.dirtfreecarpet.com/dashboard/jobs">Contact us</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  invoiceCreated: (data: {
    customerName: string
    invoiceNumber: string
    amount: number
    dueDate: string
    services: string[]
    invoiceId: string
  }) => ({
    subject: `New Invoice #${data.invoiceNumber} - Dirt Free Carpet`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>New Invoice</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>Your invoice is ready. Here are the details:</p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Due:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
          </div>

          <p>You can view and pay your invoice online through the customer portal.</p>

          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/invoices/${data.invoiceId}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View & Pay Invoice
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Questions about this invoice? Reply to this email or call us at (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  messageReply: (data: {
    customerName: string
    subject: string
    staffName: string
    replyText: string
    messageId: string
  }) => ({
    subject: `Re: ${data.subject} - Dirt Free Carpet`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1>💬 New Message Reply</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p><strong>${data.staffName}</strong> replied to your message:</p>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 0; white-space: pre-wrap;">${data.replyText}</p>
          </div>

          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/messages/${data.messageId}"
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Conversation
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              You can reply to this message through your customer portal
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}
