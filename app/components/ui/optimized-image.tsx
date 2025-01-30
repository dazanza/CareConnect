"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends React.ComponentPropsWithoutRef<typeof Image> {
  fallback?: string
  containerClassName?: string
}

/**
 * A wrapper around Next.js Image component that adds:
 * - Proper sizing and aspect ratio preservation
 * - Blur placeholder effect
 * - Fallback image support
 * - Lazy loading by default
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fallback = "/placeholder.png",
  containerClassName,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // Calculate aspect ratio for placeholder
  const aspectRatio = typeof height === 'number' && typeof width === 'number' 
    ? height / width 
    : 1

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        loading && "animate-pulse bg-muted",
        containerClassName
      )}
      style={{ aspectRatio: `${1 / aspectRatio}` }}
    >
      <Image
        src={error ? fallback : src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  )
} 
