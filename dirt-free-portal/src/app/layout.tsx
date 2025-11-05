import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { GoogleAnalytics } from '@next/third-parties/google'
import { PerformanceMonitor } from '@/components/analytics/performance-monitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dirt Free Carpet - Customer Portal',
  description: 'Manage your appointments, invoices, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <PerformanceMonitor />
          </>
        )}
      </body>
    </html>
  )
}
