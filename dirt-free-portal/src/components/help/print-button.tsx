'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 text-primary hover:underline cursor-pointer"
    >
      <Printer className="h-4 w-4" />
      Print This Page
    </button>
  )
}
