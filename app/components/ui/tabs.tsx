/**
 * Tabs Components
 * 
 * A collection of components that create an accessible tabbed interface.
 * Built on top of Radix UI's Tabs primitive with custom styling.
 */

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/**
 * Root Tabs component that manages tab state
 */
const Tabs = TabsPrimitive.Root

/**
 * TabsList Component
 * 
 * Container for tab triggers that provides keyboard navigation and styling.
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger Component
 * 
 * The clickable tab element that activates its associated content.
 * 
 * Features:
 * - Keyboard navigation support
 * - Active state styling
 * - Focus management
 * - Disabled state support
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * <TabsTrigger value="settings">
 *   Settings
 * </TabsTrigger>
 * ```
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TabsContent Component
 * 
 * Container for the content associated with each tab.
 * Only visible when its associated tab is active.
 * 
 * Features:
 * - Automatic show/hide based on active tab
 * - Focus management
 * - Accessibility attributes
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * <TabsContent value="settings">
 *   <h2>Settings Panel</h2>
 *   <p>Configure your settings here.</p>
 * </TabsContent>
 * ```
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
