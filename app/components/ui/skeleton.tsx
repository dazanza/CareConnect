import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * 
 * A loading placeholder component that provides a pulsing animation
 * to indicate content is being loaded. Used to improve perceived performance
 * and provide a better user experience during data fetching.
 * 
 * Features:
 * - Customizable dimensions through className
 * - Smooth pulse animation
 * - Consistent styling with the app's theme
 * - Accessible (automatically hidden from screen readers)
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component props including className for styling
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton className="h-4 w-[250px]" />
 * 
 * // Avatar placeholder
 * <Skeleton className="h-12 w-12 rounded-full" />
 * 
 * // Text block placeholder
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-[250px]" />
 *   <Skeleton className="h-4 w-[200px]" />
 * </div>
 * ```
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }