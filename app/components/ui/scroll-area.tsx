"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

/**
 * ScrollArea Component
 * 
 * A custom scrollable container built on Radix UI's ScrollArea primitive.
 * Provides a cross-browser consistent scrolling experience with custom styling.
 * 
 * Features:
 * - Custom scrollbar styling
 * - Cross-browser consistency
 * - Automatic scrollbar visibility
 * - Support for both vertical and horizontal scrolling
 * - Maintains native scrolling behavior
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * <ScrollArea className="h-[200px]">
 *   <div className="space-y-4">
 *     {items.map(item => (
 *       <div key={item.id}>{item.content}</div>
 *     ))}
 *   </div>
 * </ScrollArea>
 * ```
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

/**
 * ScrollBar Component
 * 
 * A custom scrollbar component that provides a styled scrollbar for the ScrollArea.
 * Can be oriented vertically or horizontally.
 * 
 * Features:
 * - Custom styling with Tailwind CSS
 * - Smooth transitions
 * - Support for both vertical and horizontal orientations
 * - Touch-friendly
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
