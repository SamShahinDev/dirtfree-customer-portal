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
}
