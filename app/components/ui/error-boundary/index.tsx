'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <h2 className="font-semibold">Something went wrong</h2>
      </div>
      <p className="text-sm mt-2">{error.message}</p>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorDisplay error={this.state.error!} />
    }

    return this.props.children
  }
}
