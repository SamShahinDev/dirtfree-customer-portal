function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  stripe: {
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    websiteUrl: getEnvVar('NEXT_PUBLIC_WEBSITE_URL'),
  },
}
