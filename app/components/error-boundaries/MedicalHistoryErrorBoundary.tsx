/**
 * MedicalHistoryErrorBoundary
 * 
 * Error boundary component specifically for medical history related components.
 * Provides error handling, logging, and retry functionality for medical history operations.
 * Follows the same pattern as MedicalRecordErrorBoundary for consistency.
 */

'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MedicalHistoryErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Medical History Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Medical History</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            <div>
              {this.state.error?.message || 'An error occurred while loading medical history data.'}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={this.handleRetry}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
} 

