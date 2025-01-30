"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

/**
 * A wrapper component that adds:
 * - Suspense boundary with fallback
 * - Error boundary with fallback
 * - Intersection Observer based lazy loading
 */
export function LazyComponent({
  children,
  fallback = <DefaultFallback />,
  onError,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "100px" } // Start loading 100px before component is visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (hasError) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Something went wrong
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <React.Suspense fallback={fallback}>
          <ErrorBoundary onError={(error) => {
            setHasError(true)
            onError?.(error)
          }}>
            {children}
          </ErrorBoundary>
        </React.Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

function DefaultFallback() {
  return (
    <div className="flex h-32 w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

class ErrorBoundary extends React.Component<{
  children: React.ReactNode
  onError: (error: Error) => void
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    return this.props.children
  }
} 
