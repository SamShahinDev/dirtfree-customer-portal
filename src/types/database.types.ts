export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          email: string
          phone: string
          first_name: string
          last_name: string
          address: string
          city: string
          state: string
          zip: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          scheduled_date: string
          scheduled_time: string
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          total_amount: number
          notes: string | null
          technician_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          customer_id: string
          job_id: string
          amount: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      loyalty_points: {
        Row: {
          id: string
          customer_id: string
          points: number
          total_earned: number
          total_redeemed: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
