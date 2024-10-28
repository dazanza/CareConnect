'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}

// Default export for backward compatibility
export default ErrorBoundary
