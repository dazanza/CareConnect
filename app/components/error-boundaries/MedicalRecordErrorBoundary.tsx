/**
 * MedicalRecordErrorBoundary
 * 
 * Error boundary component specifically for medical record related components.
 * Provides error handling, logging, and retry functionality for medical record operations.
 */

'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MedicalRecordErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Medical Record Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI for medical record components
      return (
        <Alert variant="destructive" className="my-4">
          <AlertDescription className="flex flex-col gap-4">
            <p>An error occurred while accessing medical records.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRetry}
              className="w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
} 