#!/usr/bin/env node

/**
 * Creates a test customer account for the portal
 * Usage: node scripts/create-test-customer.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test customer data
const TEST_EMAIL = 'test@dirtfree.com'
const TEST_PASSWORD = 'TestPassword123!'
const TEST_CUSTOMER = {
  name: 'John Doe',
  email: TEST_EMAIL,
  phone_e164: '+17137302782',
  address_line1: '123 Main Street',
  address_line2: 'Apt 4B',
  city: 'Houston',
  state: 'TX',
  postal_code: '77001',
  zone: 'Central',
  notes: 'Test customer for portal development'
}

async function createTestCustomer() {
  console.log('🚀 Creating test customer account...\n')

  try {
    // Step 1: Create auth user
    console.log('1️⃣  Creating auth user...')

    // First check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers.users.some(u => u.email === TEST_EMAIL)

    if (userExists) {
      console.log('   ℹ️  Auth user already exists')
    } else {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: TEST_CUSTOMER.name
        }
      })

      if (authError) throw authError
      console.log('   ✅ Auth user created:', authUser.user.email)
    }

    // Step 2: Create customer record
    console.log('\n2️⃣  Creating customer record...')

    // First check if customer exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', TEST_EMAIL)
      .single()

    let customer
    if (existingCustomer) {
      console.log('   ℹ️  Customer record already exists')
      customer = existingCustomer
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert(TEST_CUSTOMER)
        .select()
        .single()

      if (customerError) throw customerError
      customer = newCustomer
      console.log('   ✅ Customer record created:', customer.name)
    }

    // Step 3: Create loyalty points
    console.log('\n3️⃣  Creating loyalty points...')

    const { data: existingLoyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_id', customer.id)
      .single()

    if (existingLoyalty) {
      console.log('   ℹ️  Loyalty points already exist:', existingLoyalty.points, 'points')
    } else {
      const { error: loyaltyError } = await supabase
        .from('loyalty_points')
        .insert({
          customer_id: customer.id,
          points: 500,
          total_earned: 500,
          total_redeemed: 0
        })

      if (loyaltyError) throw loyaltyError
      console.log('   ✅ Loyalty points created: 500 points')
    }

    // Step 4: Create a sample completed job
    console.log('\n4️⃣  Creating sample job...')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        customer_id: customer.id,
        zone: 'Central',
        status: 'completed',
        scheduled_date: thirtyDaysAgo.toISOString().split('T')[0],
        scheduled_time_start: '09:00:00',
        scheduled_time_end: '11:00:00',
        description: 'Carpet cleaning - 3 rooms (living room, bedroom, hallway)'
      })
      .select()
      .single()

    if (jobError) throw jobError
    console.log('   ✅ Sample job created')

    // Success message
    console.log('\n' + '='.repeat(60))
    console.log('✨ Test customer account created successfully!')
    console.log('='.repeat(60))
    console.log('\n📧 Email:', TEST_EMAIL)
    console.log('🔑 Password:', TEST_PASSWORD)
    console.log('\n🌐 Login at: http://localhost:3009/login')
    console.log('\n💡 Use these credentials to log in to the portal\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

createTestCustomer()
