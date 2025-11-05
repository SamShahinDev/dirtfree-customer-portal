export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    })
  }
}

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Portal-specific events
export const trackAppointmentBooked = (serviceType: string, amount: number) => {
  event({
    action: 'appointment_booked',
    category: 'Booking',
    label: serviceType,
    value: amount,
  })
}

export const trackPaymentCompleted = (amount: number, invoiceId: string) => {
  event({
    action: 'payment_completed',
    category: 'Payment',
    label: invoiceId,
    value: amount,
  })
}

export const trackRewardRedeemed = (rewardName: string, pointsUsed: number) => {
  event({
    action: 'reward_redeemed',
    category: 'Loyalty',
    label: rewardName,
    value: pointsUsed,
  })
}

export const trackReferralSent = () => {
  event({
    action: 'referral_sent',
    category: 'Referral',
  })
}

// Performance monitoring events
export const trackWebVital = (name: string, value: number, id: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(value),
      event_label: id,
      non_interaction: true, // Don't affect bounce rate
    })
  }
}

export const trackPerformanceMetric = (metricName: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: Math.round(value),
      event_category: 'Performance',
      non_interaction: true,
    })
  }
}
