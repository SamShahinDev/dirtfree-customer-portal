// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Set up test environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_fake_key_for_testing'
process.env.RESEND_API_KEY = 're_test_fake_key_for_testing'
