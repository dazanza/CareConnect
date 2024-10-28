'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorDisplay error={this.state.error} />
    }

    return this.props.children
  }
}

export function ErrorDisplay({ error }: { error?: Error }) {
  return (
    <div className="p-4 text-center">
      <div className="flex items-center justify-center mb-2">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
      {error && (
        <p className="text-sm text-gray-600 mt-1">{error.message}</p>
      )}
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
      >
        Try again
      </button>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}
