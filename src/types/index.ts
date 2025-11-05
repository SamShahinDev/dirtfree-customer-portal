export interface Customer {
  id: string
  email: string
  phone: string
  first_name: string
  last_name: string
  full_name?: string
  address: string
  city: string
  state: string
  zip: string
  created_at: string
}

export interface Job {
  id: string
  customer_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_amount: number
  notes: string | null
  technician_name?: string
  services?: Service[]
}

export interface Service {
  id: string
  name: string
  description: string
  base_price: number
}

export interface Invoice {
  id: string
  customer_id: string
  job_id: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date: string | null
  created_at: string
}

export interface LoyaltyPoints {
  id: string
  customer_id: string
  points: number
  total_earned: number
  total_redeemed: number
}

export interface Appointment {
  id: string
  date: string
  time: string
  service: string
  technician: string
  status: string
  amount: number
}

export interface Message {
  id: string
  customer_id: string
  subject: string
  message: string
  status: 'open' | 'responded' | 'closed'
  created_at: string
  response?: string
  response_date?: string
}

export interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  type: 'discount' | 'free_service' | 'upgrade'
  value: number
}
